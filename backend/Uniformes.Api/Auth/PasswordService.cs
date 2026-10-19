namespace Uniformes.Api.Auth;

public static class PasswordService
{
    public static bool EsBcrypt(string? hash) =>
        !string.IsNullOrEmpty(hash) && (hash.StartsWith("$2a$") || hash.StartsWith("$2b$") || hash.StartsWith("$2y$"));

    public static string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: 10);

    public static bool Verify(string password, string almacenado)
    {
        if (EsBcrypt(almacenado))
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, almacenado);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }

        return string.Equals(password, almacenado, StringComparison.Ordinal);
    }
}
