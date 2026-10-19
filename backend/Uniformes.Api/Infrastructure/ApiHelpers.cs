using System.Globalization;
using System.Text.Json;

namespace Uniformes.Api.Infrastructure;

/// <summary>
/// Lectura de body JSON con semántica similar a Express req.body:
/// clave ausente = no tocar; clave presente con null = asignar null.
/// </summary>
public readonly struct JsonBody
{
    private readonly JsonElement _el;

    public JsonBody(JsonElement el)
    {
        _el = el;
    }

    public bool Objeto => _el.ValueKind == JsonValueKind.Object;

    public bool Presente(string prop) => Objeto && _el.TryGetProperty(prop, out _);

    public bool NoNulo(string prop) =>
        Presente(prop) && _el.GetProperty(prop).ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined);

    public string? Cadena(string prop)
    {
        if (!NoNulo(prop))
        {
            return null;
        }

        var valor = _el.GetProperty(prop);
        return valor.ValueKind switch
        {
            JsonValueKind.String => valor.GetString(),
            JsonValueKind.Number => valor.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => valor.GetRawText()
        };
    }

    public long? EnteroLargo(string prop)
    {
        if (!NoNulo(prop))
        {
            return null;
        }

        var valor = _el.GetProperty(prop);
        try
        {
            return valor.ValueKind switch
            {
                JsonValueKind.Number => valor.GetInt64(),
                JsonValueKind.String => long.TryParse(valor.GetString(), out var n) ? n : null,
                _ => null
            };
        }
        catch (Exception)
        {
            return null;
        }
    }

    public bool? Bool(string prop)
    {
        if (!NoNulo(prop))
        {
            return null;
        }

        var valor = _el.GetProperty(prop);
        try
        {
            return valor.ValueKind switch
            {
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.Number => valor.GetDouble() != 0,
                _ => bool.TryParse(valor.GetString(), out var b) ? b : null
            };
        }
        catch (Exception)
        {
            return null;
        }
    }

    public int? Entero(string prop)
    {
        if (!NoNulo(prop))
        {
            return null;
        }

        var valor = _el.GetProperty(prop);
        try
        {
            return valor.ValueKind switch
            {
                JsonValueKind.Number => valor.GetInt32(),
                JsonValueKind.String => int.TryParse(valor.GetString(), out var n) ? n : null,
                _ => null
            };
        }
        catch (Exception)
        {
            return null;
        }
    }

    public double? Doble(string prop)
    {
        if (!NoNulo(prop))
        {
            return null;
        }

        var valor = _el.GetProperty(prop);
        try
        {
            return valor.ValueKind switch
            {
                JsonValueKind.Number => valor.GetDouble(),
                JsonValueKind.String => double.TryParse(valor.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var d) ? d : null,
                _ => null
            };
        }
        catch (Exception)
        {
            return null;
        }
    }

    public DateTime? Fecha(string prop)
    {
        if (!NoNulo(prop))
        {
            return null;
        }

        var valor = _el.GetProperty(prop);
        try
        {
            if (valor.ValueKind == JsonValueKind.Number)
            {
                return DateTime.UnixEpoch.AddMilliseconds(valor.GetInt64());
            }

            if (valor.ValueKind == JsonValueKind.String)
            {
                var texto = valor.GetString();
                if (DateTime.TryParse(texto, null, DateTimeStyles.RoundtripKind, out var fecha))
                {
                    return fecha.Kind == DateTimeKind.Unspecified
                        ? DateTime.SpecifyKind(fecha, DateTimeKind.Utc)
                        : fecha;
                }
            }
        }
        catch (Exception)
        {
        }

        return null;
    }

    public JsonElement? Crudo(string prop) => NoNulo(prop) ? _el.GetProperty(prop) : null;

    public bool IntentarArreglo(string prop, out JsonElement arreglo)
    {
        arreglo = default;
        if (!NoNulo(prop))
        {
            return false;
        }

        var valor = _el.GetProperty(prop);
        if (valor.ValueKind != JsonValueKind.Array)
        {
            return false;
        }

        arreglo = valor;
        return true;
    }
}

/// <summary>
/// Filtros de query string comunes (?habilitado, ?incluirDeshabilitados, paginación).
/// </summary>
public static class Filtro
{
    public static bool IncluirDeshabilitados(IQueryCollection q) =>
        q.TryGetValue("incluirDeshabilitados", out var v) &&
        string.Equals(v.ToString(), "true", StringComparison.OrdinalIgnoreCase);

    public static bool? Habilitado(IQueryCollection q) =>
        q.TryGetValue("habilitado", out var v) && bool.TryParse(v, out var b) ? b : null;

    public static int? Entero(IQueryCollection q, string clave) =>
        q.TryGetValue(clave, out var v) && int.TryParse(v, out var n) ? n : null;

    public static string? Texto(IQueryCollection q, string clave) =>
        q.TryGetValue(clave, out var v) ? v.ToString() : null;

    public static int Pagina(IQueryCollection q) =>
        Math.Max(1, Entero(q, "pagina") ?? 1);

    public static int Limite(IQueryCollection q) =>
        Math.Clamp(Entero(q, "limite") ?? 10, 1, 1000);

    public static string[] Campos(IQueryCollection q) =>
        (Texto(q, "campos") ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    /// <summary>
    /// Indica si un campo participa en la búsqueda: sin ?campos → todos;
    /// con ?campos → solo los listados (case-insensitive).
    /// </summary>
    public static bool Usa(string[] campos, params string[] porDefecto) =>
        campos.Length == 0 || campos.Intersect(porDefecto, StringComparer.OrdinalIgnoreCase).Any();
}
