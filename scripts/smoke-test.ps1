# Smoke test CRUD contra la API .NET en localhost:3001
# Uso: pwsh scripts/smoke-test.ps1  (limpia los datos TEST al final)
param([string]$Base = 'http://localhost:3001/api')

$ErrorActionPreference = 'Stop'
$results = [System.Collections.Generic.List[object]]::new()

function Check([string]$nombre, [bool]$ok, [string]$detalle = '') {
    $results.Add([pscustomobject]@{ Ok = $ok; Nombre = $nombre; Detalle = $detalle })
    $mark = if ($ok) { 'PASS' } else { 'FAIL' }
    "[$mark] $nombre $(if ($detalle) { "- $detalle" })"
}

function Api([string]$metodo, [string]$ruta, $body = $null, $token = $null) {
    $h = @{ 'Content-Type' = 'application/json' }
    if ($token) { $h['Authorization'] = "Bearer $token" }
    $p = @{ Method = $metodo; Uri = "$Base$ruta"; Headers = $h; TimeoutSec = 15 }
    if ($body -ne $null) { $p.Body = ($body | ConvertTo-Json -Depth 10 -Compress) }
    try { return Invoke-RestMethod @p }
    catch {
        $codigo = 0
        try { $codigo = [int]$_.Exception.Response.StatusCode } catch { }
        return [pscustomobject]@{ __error = $true; __status = $codigo; __msg = "$($_.ErrorDetails.Message)" }
    }
}

# ---- Login ----
$login = Api POST '/auth/login' @{ username = 'admin'; password = 'admin123' }
$tok = $login.token
Check 'Login admin' ($null -ne $tok -and $login.message -eq 'Login exitoso') "token len=$($tok.Length)"

$sinAuth = Invoke-WebRequest -Uri "$Base/clientes" -SkipHttpErrorCheck -Method Get
Check 'GET sin token → 401' ($sinAuth.StatusCode -eq 401) "status=$($sinAuth.StatusCode)"

$noExiste = Api GET '/ruta-que-no-existe'
$noExisteBody = if ($noExiste.__msg) { $noExiste.__msg | ConvertFrom-Json } else { $null }
Check '404 fallback con available_routes' ($noExiste.__status -eq 404 -and $null -ne $noExisteBody.available_routes) "status=$($noExiste.__status)"

# ---- Clientes ----
$cli = Api POST '/clientes' @{ nombre = 'TEST Cliente'; telefono = '000'; email = 't@t.co'; direccion = 'Dir'; ciudad = 'Ciudad'; nit = 'TEST-NIT' } $tok
$cliId = if ($cli.id) { $cli.id } else { 0 }
Check 'POST cliente' ($cliId -gt 0) ($cli | ConvertTo-Json -Compress)

$cliU = Api PUT "/clientes/$cliId" @{ telefono = '111'; ciudad = 'Ciudad2' } $tok
Check 'PUT cliente (whitelist)' ($cliU.telefono -eq '111' -and $cliU.ciudad -eq 'Ciudad2' -and $cliU.nombre -eq 'TEST Cliente') "tel=$($cliU.telefono) nombre conservado=$($cliU.nombre)"

$cliH = Api GET "/clientes?habilitado=true" $null $tok
Check 'Lista clientes incluye nuevo' (@($cliH).Count -ge 1)

# ---- Productos ----
$prod = Api POST '/productos' @{ nombre = 'TEST Producto'; categoria = 'TEST'; precio = 100; stock = 0; stockMinimo = 5; requiereConfeccion = $true } $tok
$prodId = if ($prod.id) { $prod.id } else { 0 }
Check 'POST producto' ($prodId -gt 0) ($prod | ConvertTo-Json -Compress)

$prodU = Api PUT "/productos/$prodId" @{ precio = 250.5; stock = 7 } $tok
Check 'PUT producto (whitelist)' ([math]::Abs($prodU.precio - 250.5) -lt 0.01 -and $prodU.stock -eq 7) "precio=$($prodU.precio) stock=$($prodU.stock)"

# ---- Categorías ----
$cat = Api POST '/categorias' @{ nombre = 'TEST Cat'; descripcion = 'desc' } $tok
$catId = if ($cat.id) { $cat.id } else { 0 }
Check 'POST categoría' ($catId -gt 0)
$catU = Api PUT "/categorias/$catId" @{ descripcion = 'desc2' } $tok
Check 'PUT categoría' ($catU.descripcion -eq 'desc2')

# ---- Usuarios ----
$uid = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
$nuevoUser = Api POST '/users' @{ id = $uid; username = 'test-user'; password = 'Clave123!'; role = 'VENDEDOR'; email = 'test@t.co' } $tok
Check 'POST usuario' ($nuevoUser.username -eq 'test-user' -and $nuevoUser.email -eq 'test@t.co') ($nuevoUser | ConvertTo-Json -Compress)

$usuarios = Api GET '/users' $null $tok
$uTest = @($usuarios) | Where-Object { $_.username -eq 'test-user' } | Select-Object -First 1
Check 'GET usuarios incluye test-user con email' ($null -ne $uTest -and $uTest.email -eq 'test@t.co')

$hashOk = Api PUT "/users/$($uTest.id)" @{ password = 'NuevaClave1!' } $tok
Check 'PUT password responde OK' (-not $hashOk.__error) $hashOk.__msg

# login con el usuario de prueba (password nueva) → valida hash real
$loginUser = Api POST '/auth/login' @{ username = 'test-user'; password = 'NuevaClave1!' }
Check 'Login usuario recién creado (BCrypt round-trip)' ($null -ne $loginUser.token -and $loginUser.message -eq 'Login exitoso') $loginUser.__msg

$tokUser = $loginUser.token
$accesoAdmin = Api GET '/users' $null $tokUser
Check 'Rol VENDEDOR no admin → 403 en /users' ($accesoAdmin.__error -and $accesoAdmin.__status -eq 403) "status=$($accesoAdmin.__status)"

$patchU = Api PATCH "/users/$($uTest.id)" @{ activo = $false } $tok
Check 'PATCH usuario' (-not $patchU.__error -and $patchU.activo -eq $false) $patchU.__msg

# ---- Roles ----
$rol = Api POST '/roles' @{ nombre = 'TEST_ROL'; descripcion = 'x'; permisos = @('a.b') } $tok
$rolId = if ($rol.id) { $rol.id } else { 0 }
Check 'POST rol' ($rolId -gt 0 -and $rol.permisos -contains 'a.b') ($rol | ConvertTo-Json -Compress)
$rolU = Api PUT "/roles/$rolId" @{ descripcion = 'y' } $tok
Check 'PUT rol' ($rolU.descripcion -eq 'y')

# ---- Pedidos con detalles + regeneración de items de producción ----
$pedido = Api POST '/pedidos' @{
    numero = 'TEST-001'; clienteId = $cliId; incluirIva = $false
    subtotal = 500; total = 500
    detalles = @(@{ productoId = $prodId; cantidad = 2; precioUnitario = 250; subtotal = 500; estado = 'PENDIENTE' })
} $tok
$pedId = if ($pedido.id) { $pedido.id } else { 0 }
Check 'POST pedido con detalles' ($pedId -gt 0 -and @($pedido.detalles).Count -eq 1) ($pedido | ConvertTo-Json -Compress)

$pedidoGet = Api GET "/pedidos/$pedId" $null $tok
$det0 = @($pedidoGet.detalles)[0]
Check 'GET pedido anida cliente+producto' ($null -ne $pedidoGet.cliente -and $det0.producto.nombre -eq 'TEST Producto') "cliente=$($pedidoGet.cliente.nombre)"

# PUT con detalles → reemplaza y debe crear items de producción (producto requiereConfeccion)
$pedidoPut = Api PUT "/pedidos/$pedId" @{
    total = 750
    detalles = @(@{ productoId = $prodId; cantidad = 3; precioUnitario = 250; subtotal = 750; estado = 'PENDIENTE' })
} $tok
$nuevoDet = @($pedidoPut.detalles)[0]
Check 'PUT pedido reemplaza detalles + actualiza totales' ($pedidoPut.total -eq 750 -and @($pedidoPut.detalles).Count -eq 1 -and $nuevoDet.cantidad -eq 3) "total=$($pedidoPut.total) detalles=$(@($pedidoPut.detalles).Count) cant=$($nuevoDet.cantidad)"

# Como el legacy, la respuesta del PUT no incluye items; se verifican por GET /pedidos/{id}
$pedidoItems = Api GET "/pedidos/$pedId" $null $tok
$detConItems = @($pedidoItems.detalles)[0]
Check 'PUT regenera item de producción (requiereConfeccion)' ($null -ne $detConItems.itemsProduccion -and @($detConItems.itemsProduccion).Count -eq 1 -and @($detConItems.itemsProduccion)[0].cantidad -eq 3) "items=$(@($detConItems.itemsProduccion).Count)"

$detalles = Api GET "/pedidos/$pedId/detalles" $null $tok
Check 'GET /pedidos/{id}/detalles' (@($detalles).Count -eq 1 -and $detalles[0].id -eq $nuevoDet.id)

$detU = Api PUT "/pedidos/$pedId/detalles/$($nuevoDet.id)" @{ cantidad = 5; subtotal = 1250 } $tok
Check 'PUT detalle de pedido' ($detU.cantidad -eq 5 -and $detU.subtotal -eq 1250) "cant=$($detU.cantidad)"

$pedPatch = Api PATCH "/pedidos/$pedId" @{ observaciones = 'nota test' } $tok
Check 'PATCH pedido' ($pedPatch.observaciones -eq 'nota test')

# ---- Producción ----
$items = Api GET '/produccion' $null $tok
$itemMio = @($items) | Where-Object { $_.detalleId -eq $nuevoDet.id } | Select-Object -First 1
Check 'GET producción trae item regenerado con anidamiento' ($null -ne $itemMio -and $null -ne $itemMio.producto -and $null -ne $itemMio.detalle.pedido -and $itemMio.cliente.nombre -eq 'TEST Cliente') "numeroPedido=$($itemMio.numeroPedido) pedido.en.detalle=$($null -ne $itemMio.detalle.pedido)"

$itemId = if ($itemMio) { $itemMio.id } else { 0 }
$itemPatch = Api PATCH "/produccion/$itemId" @{ observaciones = 'en confeccion' } $tok
Check 'PATCH producción' ($itemPatch.observaciones -eq 'en confeccion') $itemPatch.__msg

$itemPut = Api PUT "/produccion/$itemId" @{ cantidad = 9 } $tok
Check 'PUT producción' ($itemPut.cantidad -eq 9)

$pend = Api GET '/produccion/pendientes' $null $tok
$hayPendiente = $null -ne (@($pend) | Where-Object { $_.detallePedidoId -eq $nuevoDet.id } | Select-Object -First 1)
Check 'GET producción/pendientes incluye detalle PENDIENTE' $hayPendiente

# ---- Inventario (stock=0 → CRÍTICO) ----
$null = Api PUT "/productos/$prodId" @{ stock = 0 } $tok
$inv = Api GET '/inventario' $null $tok
$itemInv = @($inv) | Where-Object { $_.id -eq $prodId } | Select-Object -First 1
Check 'Inventario calcula estado CRÍTICO (stock 0)' ($itemInv.estado -eq 'CRÍTICO') "estado=$($itemInv.estado) stock=$($itemInv.stock)"

# ---- Paginado / buscar / conteo ----
$pag = Api GET '/productos/paginado?limite=2&pagina=1' $null $tok
Check 'Productos paginado {data,total,pagina,limite}' ($null -ne $pag.data -and $null -ne $pag.total -and $pag.pagina -eq 1) "total=$($pag.total)"

$cont = Api GET '/clientes/conteo?habilitado=true' $null $tok
Check 'Clientes conteo {conteo}' ($cont.conteo -ge 1) "conteo=$($cont.conteo)"

$busc = Api GET '/productos/buscar?buscar=TEST&campos=nombre' $null $tok
Check 'Productos buscar filtra por nombre' (@($busc).Count -ge 1 -and @($busc)[0].nombre -like '*TEST*') "n=$(@($busc).Count)"

# ---- Borrados lógicos (roles se eliminan con PATCH, como hace el frontend) ----
$d1 = Api DELETE "/pedidos/$pedId" $null $tok
$d2 = Api DELETE "/productos/$prodId" $null $tok
$d3 = Api DELETE "/clientes/$cliId" $null $tok
$d4 = Api DELETE "/users/$($uTest.id)" $null $tok
$d5 = Api DELETE "/categorias/$catId" $null $tok
$d6 = Api PATCH "/roles/$rolId" @{ habilitado = $false } $tok
$d7 = Api DELETE "/produccion/$itemId" $null $tok
Check 'Borrados lógicos responden OK' (-not ($d1.__error -or $d2.__error -or $d3.__error -or $d4.__error -or $d5.__error -or $d6.__error -or $d7.__error)) "ped=$($d1.__error) prod=$($d2.__error) cli=$($d3.__error) usr=$($d4.__error) cat=$($d5.__error) rol=$($d6.__error) item=$($d7.__error)"

$pedidosTras = Api GET '/pedidos' $null $tok
$estaDesh = @($pedidosTras) | Where-Object { $_.id -eq $pedId } | Select-Object -First 1
Check 'Pedido borrado NO aparece en lista por defecto' ($null -eq $estaDesh)

$pedidosIncl = Api GET '/pedidos?incluirDeshabilitados=true' $null $tok
$estaIncl = @($pedidosIncl) | Where-Object { $_.id -eq $pedId } | Select-Object -First 1
Check 'Aparece con ?incluirDeshabilitados=true' ($null -ne $estaIncl -and $estaIncl.habilitado -eq $false)

# ---- Limpieza de datos TEST en la DB ----
""
'--- Limpiando datos TEST ---'
& node scripts/cleanup-test-data.js
if ($LASTEXITCODE -ne 0) { 'Aviso: limpieza devolvió error' }

# ---- Resumen ----
$fallidos = @($results | Where-Object { -not $_.Ok })
""
"══════════════════════════════════"
"TOTAL: $($results.Count) | PASAN: $($results.Count - $fallidos.Count) | FALLAN: $($fallidos.Count)"
if ($fallidos) { $fallidos | ForEach-Object { "  FAIL: $($_.Nombre) → $($_.Detalles)" } }
# IDs para limpieza
""
"IDS_TEST: cliente=$cliId producto=$prodId categoria=$catId usuario=$($uTest.id) rol=$rolId pedido=$pedId"
exit $(if ($fallidos.Count) { 1 } else { 0 })
