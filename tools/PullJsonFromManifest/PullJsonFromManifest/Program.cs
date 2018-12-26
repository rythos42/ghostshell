using System;
using System.IO;
using System.Data.SQLite;

namespace PullJsonFromManifest
{
    class Program
    {
        public class DbData
        {
            public DbData()
            {
                Filter = json => { return true; };
            }

            public string JsonKey { get; set; }
            public string Table { get; set; }
            public Func<string, bool> Filter { get; set; }
        }

        static void Main(string[] args)
        {
            var databaseFile = args[0];
            var dbConnection = new SQLiteConnection($"Data Source={databaseFile}");
            dbConnection.Open();

            var dbReaderList = new[]
            {
                new DbData{ JsonKey = "race", Table = "DestinyRaceDefinition" },
                new DbData{ JsonKey = "gender", Table = "DestinyGenderDefinition" },
                new DbData{ JsonKey = "class", Table = "DestinyClassDefinition" },
                new DbData{ JsonKey = "inventory", Table = "DestinyInventoryItemDefinition",
                    Filter = json => { return
                        json.Contains("\"bucketTypeHash\":4023194814")
                        || json.Contains("\"plugCategoryHash\":1820735122"); } },
            };

            using (var fileStream = new FileStream("destinymanifest.json", FileMode.Create, FileAccess.Write))
            {
                using (var stream = new StreamWriter(fileStream))
                {
                    var tablePrefix = "";
                    stream.Write("{");
                    foreach (var dbReadData in dbReaderList)
                    {
                        stream.Write($"{tablePrefix}\"{dbReadData.JsonKey}\":");
                        stream.Write("{");

                        using (var command = new SQLiteCommand($"select * from {dbReadData.Table}", dbConnection))
                        {
                            using (var reader = command.ExecuteReader())
                            {
                                var rowPrefix = "";
                                while (reader.Read())
                                {
                                    var bytes = (byte[])reader["json"];
                                    var json = System.Text.Encoding.UTF8.GetString(bytes);
                                    var id = reader["id"];

                                    if (dbReadData.Filter(json))
                                    {
                                        stream.Write($"{rowPrefix}\"{id}\": {json}");
                                        rowPrefix = ",";
                                    }
                                };
                            }
                        }

                        stream.Write("}");
                        tablePrefix = ",";
                    }
                    stream.Write("}");
                    stream.Close();
                }
            }
        }
    }
}