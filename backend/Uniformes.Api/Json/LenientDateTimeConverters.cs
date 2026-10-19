using System.Text.Json;
using System.Text.Json.Serialization;

namespace Uniformes.Api.Json;

public sealed class LenientDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var texto = reader.GetString();
            if (DateTime.TryParse(texto, null, System.Globalization.DateTimeStyles.RoundtripKind, out var fecha))
            {
                return fecha.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(fecha, DateTimeKind.Utc)
                    : fecha;
            }
            throw new JsonException($"Fecha inválida: '{texto}'");
        }

        if (reader.TokenType == JsonTokenType.Number)
        {
            return DateTime.UnixEpoch.AddMilliseconds(reader.GetInt64());
        }

        throw new JsonException("Se esperaba una fecha.");
    }

    public override void Write(Utf8JsonWriter writer, DateTime valor, JsonSerializerOptions options) =>
        writer.WriteStringValue(valor.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
}

public sealed class LenientNullableDateTimeConverter : JsonConverter<DateTime?>
{
    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        var interno = new LenientDateTimeConverter();
        return interno.Read(ref reader, typeof(DateTime), options);
    }

    public override void Write(Utf8JsonWriter writer, DateTime? valor, JsonSerializerOptions options)
    {
        if (valor is null)
        {
            writer.WriteNullValue();
        }
        else
        {
            writer.WriteStringValue(valor.Value.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
        }
    }
}
