using System;
using System.IO;
using System.Data.SQLite;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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
                                        json = CleanUp(json);
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

        static string CleanUp(string json)
        {
            var obj = JObject.Parse(json);

            obj.Remove("backgroundColor");
            obj.Remove("action");
            obj.Remove("inventory");
            obj.Remove("plug");
            obj.Remove("perks");
            obj.Remove("itemCategoryHashes");
            obj.Remove("blacklisted");
            obj.Remove("redacted");
            obj.Remove("index");
            obj.Remove("defaultDamageType");
            obj.Remove("equippable");
            obj.Remove("classType");
            obj.Remove("itemSubType");
            obj.Remove("itemType");
            obj.Remove("specialItemType");
            obj.Remove("nonTransferrable");
            obj.Remove("doesPostmasterPullHaveSideEffects");
            obj.Remove("allowActions");
            obj.Remove("investmentStats");
            obj.Remove("acquireUnlockHash");
            obj.Remove("acquireRewardSiteHash");
            obj.Remove("displaySource");
            obj.Remove("itemTypeAndTierDisplayName");
            obj.Remove("uiItemDisplayStyle");
            obj.Remove("itemTypeDisplayName");
            obj.Remove("tooltipStyle");
            obj.Remove("sourceData");
            obj.Remove("objectives");
            obj.Remove("questlineItemHash");
            obj.Remove("narrative");
            obj.Remove("objectiveVerbName");
            obj.Remove("questTypeIdentifier");
            obj.Remove("questTypeHash");
            obj.Remove("collectibleHash");
            obj.Remove("stats");
            obj.Remove("equippingBlock");
            obj.Remove("translationBlock");
            obj.Remove("preview");
            obj.Remove("quality");
            obj.Remove("socketCategories");
            obj.Remove("intrinsicSockets");
            obj.Remove("talentGrid");
            obj.Remove("screenshot");
            obj.Remove("sockets");

            return obj.ToString(Formatting.None);
        }
    }
}