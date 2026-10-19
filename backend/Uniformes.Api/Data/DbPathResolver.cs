namespace Uniformes.Api.Data;

public static class DbPathResolver
{
    public static string Resolve(IConfiguration configuration)
    {
        var configurado = configuration.GetConnectionString("UniformesDb");
        if (!string.IsNullOrWhiteSpace(configurado))
        {
            return configurado;
        }

        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var candidato = Path.Combine(dir.FullName, "prisma", "uniformes.db");
            if (File.Exists(candidato))
            {
                return candidato;
            }
            dir = dir.Parent;
        }

        throw new FileNotFoundException(
            "No se encontró prisma/uniformes.db subiendo desde " + AppContext.BaseDirectory +
            ". Define ConnectionStrings:UniformesDb en appsettings.");
    }
}
