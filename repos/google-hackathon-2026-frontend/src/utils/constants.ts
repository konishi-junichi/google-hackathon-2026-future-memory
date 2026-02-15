import type { TranslationKey } from './translations';

export interface LocalizedItem {
    jp: string;
    en: string;
}

export interface RegionGroup {
    region: LocalizedItem;
    // region_key is deprecated in favor of region.en/jp but kept for compatibility if needed, 
    // though we will likely switch to using the localized objects directly.
    region_key: TranslationKey;
    prefectures: LocalizedItem[];
}

export const regionGroups: RegionGroup[] = [
    {
        region: { jp: "北海道", en: "Hokkaido" },
        region_key: 'data.region.hokkaido',
        prefectures: [{ jp: "北海道", en: "Hokkaido" }]
    },
    {
        region: { jp: "東北", en: "Tohoku" },
        region_key: 'data.region.tohoku',
        prefectures: [
            { jp: "青森県", en: "Aomori" }, { jp: "岩手県", en: "Iwate" },
            { jp: "宮城県", en: "Miyagi" }, { jp: "秋田県", en: "Akita" },
            { jp: "山形県", en: "Yamagata" }, { jp: "福島県", en: "Fukushima" }
        ]
    },
    {
        region: { jp: "関東", en: "Kanto" },
        region_key: 'data.region.kanto',
        prefectures: [
            { jp: "茨城県", en: "Ibaraki" }, { jp: "栃木県", en: "Tochigi" },
            { jp: "群馬県", en: "Gunma" }, { jp: "埼玉県", en: "Saitama" },
            { jp: "千葉県", en: "Chiba" }, { jp: "東京都", en: "Tokyo" },
            { jp: "神奈川県", en: "Kanagawa" }
        ]
    },
    {
        region: { jp: "中部", en: "Chubu" },
        region_key: 'data.region.chubu',
        prefectures: [
            { jp: "新潟県", en: "Niigata" }, { jp: "富山県", en: "Toyama" },
            { jp: "石川県", en: "Ishikawa" }, { jp: "福井県", en: "Fukui" },
            { jp: "山梨県", en: "Yamanashi" }, { jp: "長野県", en: "Nagano" },
            { jp: "岐阜県", en: "Gifu" }, { jp: "静岡県", en: "Shizuoka" },
            { jp: "愛知県", en: "Aichi" }
        ]
    },
    {
        region: { jp: "近畿", en: "Kinki" },
        region_key: 'data.region.kinki',
        prefectures: [
            { jp: "三重県", en: "Mie" }, { jp: "滋賀県", en: "Shiga" },
            { jp: "京都府", en: "Kyoto" }, { jp: "大阪府", en: "Osaka" },
            { jp: "兵庫県", en: "Hyogo" }, { jp: "奈良県", en: "Nara" },
            { jp: "和歌山県", en: "Wakayama" }
        ]
    },
    {
        region: { jp: "中国", en: "Chugoku" },
        region_key: 'data.region.chugoku',
        prefectures: [
            { jp: "鳥取県", en: "Tottori" }, { jp: "島根県", en: "Shimane" },
            { jp: "岡山県", en: "Okayama" }, { jp: "広島県", en: "Hiroshima" },
            { jp: "山口県", en: "Yamaguchi" }
        ]
    },
    {
        region: { jp: "四国", en: "Shikoku" },
        region_key: 'data.region.shikoku',
        prefectures: [
            { jp: "徳島県", en: "Tokushima" }, { jp: "香川県", en: "Kagawa" },
            { jp: "愛媛県", en: "Ehime" }, { jp: "高知県", en: "Kochi" }
        ]
    },
    {
        region: { jp: "九州・沖縄", en: "Kyushu & Okinawa" },
        region_key: 'data.region.kyushu_okinawa',
        prefectures: [
            { jp: "福岡県", en: "Fukuoka" }, { jp: "佐賀県", en: "Saga" },
            { jp: "長崎県", en: "Nagasaki" }, { jp: "熊本県", en: "Kumamoto" },
            { jp: "大分県", en: "Oita" }, { jp: "宮崎県", en: "Miyazaki" },
            { jp: "鹿児島県", en: "Kagoshima" }, { jp: "沖縄県", en: "Okinawa" }
        ]
    }
];

// Helper to get flat list if needed
export const allPrefectures = regionGroups.flatMap(group => group.prefectures);

export const citiesByPrefecture: Record<string, LocalizedItem[]> = {
    "北海道": [
        { jp: "札幌市", en: "Sapporo" }, { jp: "函館市", en: "Hakodate" }, { jp: "小樽市", en: "Otaru" },
        { jp: "旭川市", en: "Asahikawa" }, { jp: "室蘭市", en: "Muroran" }, { jp: "釧路市", en: "Kushiro" },
        { jp: "帯広市", en: "Obihiro" }, { jp: "北見市", en: "Kitami" }, { jp: "夕張市", en: "Yubari" },
        { jp: "網走市", en: "Abashiri" }, { jp: "留萌市", en: "Rumoi" }, { jp: "苫小牧市", en: "Tomakomai" },
        { jp: "稚内市", en: "Wakkanai" }, { jp: "美唄市", en: "Bibai" }, { jp: "芦別市", en: "Ashibetsu" },
        { jp: "江別市", en: "Ebetsu" }, { jp: "赤平市", en: "Akabira" }, { jp: "紋別市", en: "Mombetsu" },
        { jp: "士別市", en: "Shibetsu" }, { jp: "名寄市", en: "Nayoro" }, { jp: "三笠市", en: "Mikasa" },
        { jp: "根室市", en: "Nemuro" }, { jp: "千歳市", en: "Chitose" }, { jp: "滝川市", en: "Takikawa" },
        { jp: "砂川市", en: "Sunagawa" }, { jp: "歌志内市", en: "Utashinai" }, { jp: "深川市", en: "Fukagawa" },
        { jp: "富良野市", en: "Furano" }, { jp: "登別市", en: "Noboribetsu" }, { jp: "恵庭市", en: "Eniwa" },
        { jp: "伊達市", en: "Date" }, { jp: "北広島市", en: "Kitahiroshima" }, { jp: "石狩市", en: "Ishikari" },
        { jp: "北斗市", en: "Hokuto" }
    ],
    "青森県": [
        { jp: "青森市", en: "Aomori" }, { jp: "弘前市", en: "Hirosaki" }, { jp: "八戸市", en: "Hachinohe" },
        { jp: "黒石市", en: "Kuroishi" }, { jp: "五所川原市", en: "Goshogawara" }, { jp: "十和田市", en: "Towada" },
        { jp: "三沢市", en: "Misawa" }, { jp: "むつ市", en: "Mutsu" }, { jp: "つがる市", en: "Tsugaru" },
        { jp: "平川市", en: "Hirakawa" }
    ],
    "岩手県": [
        { jp: "盛岡市", en: "Morioka" }, { jp: "宮古市", en: "Miyako" }, { jp: "大船渡市", en: "Ofunato" },
        { jp: "花巻市", en: "Hanamaki" }, { jp: "北上市", en: "Kitakami" }, { jp: "久慈市", en: "Kuji" },
        { jp: "遠野市", en: "Tono" }, { jp: "一関市", en: "Ichinoseki" }, { jp: "陸前高田市", en: "Rikuzentakata" },
        { jp: "釜石市", en: "Kamaishi" }, { jp: "二戸市", en: "Ninohe" }, { jp: "八幡平市", en: "Hachimantai" },
        { jp: "奥州市", en: "Oshu" }, { jp: "滝沢市", en: "Takizawa" }
    ],
    "宮城県": [
        { jp: "仙台市", en: "Sendai" }, { jp: "石巻市", en: "Ishinomaki" }, { jp: "塩竈市", en: "Shiogama" },
        { jp: "気仙沼市", en: "Kesennuma" }, { jp: "白石市", en: "Shiroishi" }, { jp: "名取市", en: "Natori" },
        { jp: "角田市", en: "Kakuda" }, { jp: "多賀城市", en: "Tagajo" }, { jp: "岩沼市", en: "Iwanuma" },
        { jp: "登米市", en: "Tome" }, { jp: "栗原市", en: "Kurihara" }, { jp: "東松島市", en: "Higashimatsushima" },
        { jp: "大崎市", en: "Osaki" }, { jp: "富谷市", en: "Tomiya" }
    ],
    "秋田県": [
        { jp: "秋田市", en: "Akita" }, { jp: "能代市", en: "Noshiro" }, { jp: "横手市", en: "Yokote" },
        { jp: "大館市", en: "Odate" }, { jp: "男鹿市", en: "Oga" }, { jp: "湯沢市", en: "Yuzawa" },
        { jp: "鹿角市", en: "Kazuno" }, { jp: "由利本荘市", en: "Yurihonjo" }, { jp: "潟上市", en: "Katagami" },
        { jp: "大仙市", en: "Daisen" }, { jp: "北秋田市", en: "Kitaakita" }, { jp: "にかほ市", en: "Nikaho" },
        { jp: "仙北市", en: "Semboku" }
    ],
    "山形県": [
        { jp: "山形市", en: "Yamagata" }, { jp: "米沢市", en: "Yonezawa" }, { jp: "鶴岡市", en: "Tsuruoka" },
        { jp: "酒田市", en: "Sakata" }, { jp: "新庄市", en: "Shinjo" }, { jp: "寒河江市", en: "Sagae" },
        { jp: "上山市", en: "Kaminoyama" }, { jp: "村山市", en: "Murayama" }, { jp: "長井市", en: "Nagai" },
        { jp: "天童市", en: "Tendo" }, { jp: "東根市", en: "Higashine" }, { jp: "尾花沢市", en: "Obanazawa" },
        { jp: "南陽市", en: "Nanyo" }
    ],
    "福島県": [
        { jp: "福島市", en: "Fukushima" }, { jp: "会津若松市", en: "Aizuwakamatsu" }, { jp: "郡山市", en: "Koriyama" },
        { jp: "いわき市", en: "Iwaki" }, { jp: "白河市", en: "Shirakawa" }, { jp: "須賀川市", en: "Sukagawa" },
        { jp: "喜多方市", en: "Kitakata" }, { jp: "相馬市", en: "Soma" }, { jp: "二本松市", en: "Nihonmatsu" },
        { jp: "田村市", en: "Tamura" }, { jp: "南相馬市", en: "Minamisoma" }, { jp: "伊達市", en: "Date" },
        { jp: "本宮市", en: "Motomiya" }
    ],
    "茨城県": [
        { jp: "水戸市", en: "Mito" }, { jp: "日立市", en: "Hitachi" }, { jp: "土浦市", en: "Tsuchiura" },
        { jp: "古河市", en: "Koga" }, { jp: "石岡市", en: "Ishioka" }, { jp: "結城市", en: "Yuki" },
        { jp: "龍ケ崎市", en: "Ryugasaki" }, { jp: "下妻市", en: "Shimotsuma" }, { jp: "常総市", en: "Joso" },
        { jp: "常陸太田市", en: "Hitachiota" }, { jp: "高萩市", en: "Takahagi" }, { jp: "北茨城市", en: "Kitaibaraki" },
        { jp: "笠間市", en: "Kasama" }, { jp: "取手市", en: "Toride" }, { jp: "牛久市", en: "Ushiku" },
        { jp: "つくば市", en: "Tsukuba" }, { jp: "ひたちなか市", en: "Hitachinaka" }, { jp: "鹿嶋市", en: "Kashima" },
        { jp: "潮来市", en: "Itako" }, { jp: "守谷市", en: "Moriya" }, { jp: "常陸大宮市", en: "Hitachiomiya" },
        { jp: "那珂市", en: "Naka" }, { jp: "筑西市", en: "Chikusei" }, { jp: "坂東市", en: "Bando" },
        { jp: "稲敷市", en: "Inashiki" }, { jp: "かすみがうら市", en: "Kasumigaura" }, { jp: "桜川市", en: "Sakuragawa" },
        { jp: "神栖市", en: "Kamisu" }, { jp: "行方市", en: "Namegata" }, { jp: "鉾田市", en: "Hokota" },
        { jp: "つくばみらい市", en: "Tsukubamirai" }, { jp: "小美玉市", en: "Omitama" }
    ],
    "栃木県": [
        { jp: "宇都宮市", en: "Utsunomiya" }, { jp: "足利市", en: "Ashikaga" }, { jp: "栃木市", en: "Tochigi" },
        { jp: "佐野市", en: "Sano" }, { jp: "鹿沼市", en: "Kanuma" }, { jp: "日光市", en: "Nikko" },
        { jp: "小山市", en: "Oyama" }, { jp: "真岡市", en: "Moka" }, { jp: "大田原市", en: "Otawara" },
        { jp: "矢板市", en: "Yaita" }, { jp: "那須塩原市", en: "Nasushiobara" }, { jp: "さくら市", en: "Sakura" },
        { jp: "那須烏山市", en: "Nasukarasuyama" }, { jp: "下野市", en: "Shimotsuke" }
    ],
    "群馬県": [
        { jp: "前橋市", en: "Maebashi" }, { jp: "高崎市", en: "Takasaki" }, { jp: "桐生市", en: "Kiryu" },
        { jp: "伊勢崎市", en: "Isesaki" }, { jp: "太田市", en: "Ota" }, { jp: "沼田市", en: "Numata" },
        { jp: "館林市", en: "Tatebayashi" }, { jp: "渋川市", en: "Shibukawa" }, { jp: "藤岡市", en: "Fujioka" },
        { jp: "富岡市", en: "Tomioka" }, { jp: "安中市", en: "Annaka" }, { jp: "みどり市", en: "Midori" }
    ],
    "埼玉県": [
        { jp: "さいたま市", en: "Saitama" }, { jp: "川越市", en: "Kawagoe" }, { jp: "熊谷市", en: "Kumagaya" },
        { jp: "川口市", en: "Kawaguchi" }, { jp: "行田市", en: "Gyoda" }, { jp: "秩父市", en: "Chichibu" },
        { jp: "所沢市", en: "Tokorozawa" }, { jp: "飯能市", en: "Hanno" }, { jp: "加須市", en: "Kazo" },
        { jp: "本庄市", en: "Honjo" }, { jp: "東松島市", en: "Higashimatsuyama" }, { jp: "狭山市", en: "Sayama" },
        { jp: "羽生市", en: "Hanyu" }, { jp: "鴻巣市", en: "Konosu" }, { jp: "深谷市", en: "Fukaya" },
        { jp: "上尾市", en: "Ageo" }, { jp: "草加市", en: "Soka" }, { jp: "越谷市", en: "Koshigaya" },
        { jp: "蕨市", en: "Warabi" }, { jp: "戸田市", en: "Toda" }, { jp: "入間市", en: "Iruma" },
        { jp: "朝霞市", en: "Asaka" }, { jp: "志木市", en: "Shiki" }, { jp: "和光市", en: "Wako" },
        { jp: "新座市", en: "Niiza" }, { jp: "桶川市", en: "Okegawa" }, { jp: "久喜市", en: "Kuki" },
        { jp: "北本市", en: "Kitamoto" }, { jp: "八潮市", en: "Yashio" }, { jp: "富士見市", en: "Fujimi" },
        { jp: "三郷市", en: "Misato" }, { jp: "蓮田市", en: "Hasuda" }, { jp: "坂戸市", en: "Sakado" },
        { jp: "幸手市", en: "Satte" }, { jp: "鶴ヶ島市", en: "Tsurugashima" }, { jp: "日高市", en: "Hidaka" },
        { jp: "吉川市", en: "Yoshikawa" }, { jp: "ふじみ野市", en: "Fujimino" }, { jp: "白岡市", en: "Shiraoka" }
    ],
    "千葉県": [
        { jp: "千葉市", en: "Chiba" }, { jp: "銚子市", en: "Choshi" }, { jp: "市川市", en: "Ichikawa" },
        { jp: "船橋市", en: "Funabashi" }, { jp: "館山市", en: "Tateyama" }, { jp: "木更津市", en: "Kisarazu" },
        { jp: "松戸市", en: "Matsudo" }, { jp: "野田市", en: "Noda" }, { jp: "茂原市", en: "Mobara" },
        { jp: "成田市", en: "Narita" }, { jp: "佐倉市", en: "Sakura" }, { jp: "東金市", en: "Togane" },
        { jp: "旭市", en: "Asahi" }, { jp: "習志野市", en: "Narashino" }, { jp: "柏市", en: "Kashiwa" },
        { jp: "勝浦市", en: "Katsuura" }, { jp: "市原市", en: "Ichihara" }, { jp: "流山市", en: "Nagareyama" },
        { jp: "八千代市", en: "Yachiyo" }, { jp: "我孫子市", en: "Abiko" }, { jp: "鴨川市", en: "Kamogawa" },
        { jp: "鎌ケ谷市", en: "Kamagaya" }, { jp: "君津市", en: "Kimitsu" }, { jp: "富津市", en: "Futtsu" },
        { jp: "浦安市", en: "Urayasu" }, { jp: "四街道市", en: "Yotsukaido" }, { jp: "袖ケ浦市", en: "Sodegaura" },
        { jp: "八街市", en: "Yachimata" }, { jp: "印西市", en: "Inzai" }, { jp: "白井市", en: "Shiroi" },
        { jp: "富里市", en: "Tomisato" }, { jp: "南房総市", en: "Minamiboso" }, { jp: "匝瑳市", en: "Sosa" },
        { jp: "香取市", en: "Katori" }, { jp: "山武市", en: "Sammu" }, { jp: "いすみ市", en: "Isumi" },
        { jp: "大網白里市", en: "Oamishirasato" }
    ],
    "東京都": [
        { jp: "千代田区", en: "Chiyoda" }, { jp: "中央区", en: "Chuo" }, { jp: "港区", en: "Minato" },
        { jp: "新宿区", en: "Shinjuku" }, { jp: "文京区", en: "Bunkyo" }, { jp: "台東区", en: "Taito" },
        { jp: "墨田区", en: "Sumida" }, { jp: "江東区", en: "Koto" }, { jp: "品川区", en: "Shinagawa" },
        { jp: "目黒区", en: "Meguro" }, { jp: "大田区", en: "Ota" }, { jp: "世田谷区", en: "Setagaya" },
        { jp: "渋谷区", en: "Shibuya" }, { jp: "中野区", en: "Nakano" }, { jp: "杉並区", en: "Suginami" },
        { jp: "豊島区", en: "Toshima" }, { jp: "北区", en: "Kita" }, { jp: "荒川区", en: "Arakawa" },
        { jp: "板橋区", en: "Itabashi" }, { jp: "練馬区", en: "Nerima" }, { jp: "足立区", en: "Adachi" },
        { jp: "葛飾区", en: "Katsushika" }, { jp: "江戸川区", en: "Edogawa" }, { jp: "八王子市", en: "Hachioji" },
        { jp: "立川市", en: "Tachikawa" }, { jp: "武蔵野市", en: "Musashino" }, { jp: "三鷹市", en: "Mitaka" },
        { jp: "青梅市", en: "Ome" }, { jp: "府中市", en: "Fuchu" }, { jp: "昭島市", en: "Akishima" },
        { jp: "調布市", en: "Chofu" }, { jp: "町田市", en: "Machida" }, { jp: "小金井市", en: "Koganei" },
        { jp: "小平市", en: "Kodaira" }, { jp: "日野市", en: "Hino" }, { jp: "東村山市", en: "Higashimurayama" },
        { jp: "国分寺市", en: "Kokubunji" }, { jp: "国立市", en: "Kunitachi" }, { jp: "福生市", en: "Fussa" },
        { jp: "狛江市", en: "Komae" }, { jp: "東大和市", en: "Higashiyamato" }, { jp: "清瀬市", en: "Kiyose" },
        { jp: "東久留米市", en: "Higashikurume" }, { jp: "武蔵村山市", en: "Musashimurayama" }, { jp: "多摩市", en: "Tama" },
        { jp: "稲城市", en: "Inagi" }, { jp: "羽村市", en: "Hamura" }, { jp: "あきる野市", en: "Akiruno" },
        { jp: "西東京市", en: "Nishitokyo" }
    ],
    "神奈川県": [
        { jp: "横浜市", en: "Yokohama" }, { jp: "川崎市", en: "Kawasaki" }, { jp: "相模原市", en: "Sagamihara" },
        { jp: "横須賀市", en: "Yokosuka" }, { jp: "平塚市", en: "Hiratsuka" }, { jp: "鎌倉市", en: "Kamakura" },
        { jp: "藤沢市", en: "Fujisawa" }, { jp: "小田原市", en: "Odawara" }, { jp: "茅ヶ崎市", en: "Chigasaki" },
        { jp: "逗子市", en: "Zushi" }, { jp: "三浦市", en: "Miura" }, { jp: "秦野市", en: "Hadano" },
        { jp: "厚木市", en: "Atsugi" }, { jp: "大和市", en: "Yamato" }, { jp: "伊勢原市", en: "Isehara" },
        { jp: "海老名市", en: "Ebina" }, { jp: "座間市", en: "Zama" }, { jp: "南足柄市", en: "Minamiashigara" },
        { jp: "綾瀬市", en: "Ayase" }
    ],
    "新潟県": [
        { jp: "新潟市", en: "Niigata" }, { jp: "長岡市", en: "Nagaoka" }, { jp: "三条市", en: "Sanjo" },
        { jp: "柏崎市", en: "Kashiwazaki" }, { jp: "新発田市", en: "Shibata" }, { jp: "小千谷市", en: "Ojiya" },
        { jp: "加茂市", en: "Kamo" }, { jp: "十日町市", en: "Tokamachi" }, { jp: "見附市", en: "Mitsuke" },
        { jp: "村山市", en: "Murakami" }, { jp: "燕市", en: "Tsubame" }, { jp: "糸魚川市", en: "Itoigawa" },
        { jp: "妙高市", en: "Myoko" }, { jp: "五泉市", en: "Gosen" }, { jp: "上越市", en: "Joetsu" },
        { jp: "阿賀野市", en: "Agano" }, { jp: "佐渡市", en: "Sado" }, { jp: "魚沼市", en: "Uonuma" },
        { jp: "南魚沼市", en: "Minamiuonuma" }, { jp: "胎内市", en: "Tainai" }
    ],
    "富山県": [
        { jp: "富山市", en: "Toyama" }, { jp: "高岡市", en: "Takaoka" }, { jp: "魚津市", en: "Uozu" },
        { jp: "氷見市", en: "Himi" }, { jp: "滑川市", en: "Namerikawa" }, { jp: "黒部市", en: "Kurobe" },
        { jp: "砺波市", en: "Tonami" }, { jp: "小矢部市", en: "Oyabe" }, { jp: "南砺市", en: "Nanto" },
        { jp: "射水市", en: "Imizu" }
    ],
    "石川県": [
        { jp: "金沢市", en: "Kanazawa" }, { jp: "七尾市", en: "Nanao" }, { jp: "小松市", en: "Komatsu" },
        { jp: "輪島市", en: "Wajima" }, { jp: "珠洲市", en: "Suzu" }, { jp: "加賀市", en: "Kaga" },
        { jp: "羽咋市", en: "Hakui" }, { jp: "かほく市", en: "Kahoku" }, { jp: "白山市", en: "Hakusan" },
        { jp: "能美市", en: "Nomi" }, { jp: "野々市市", en: "Nonoichi" }
    ],
    "福井県": [
        { jp: "福井市", en: "Fukui" }, { jp: "敦賀市", en: "Tsuruga" }, { jp: "小浜市", en: "Obama" },
        { jp: "大野市", en: "Ono" }, { jp: "勝山市", en: "Katsuyama" }, { jp: "鯖江市", en: "Sabae" },
        { jp: "あわら市", en: "Awara" }, { jp: "越前市", en: "Echizen" }, { jp: "坂井市", en: "Sakai" }
    ],
    "山梨県": [
        { jp: "甲府市", en: "Kofu" }, { jp: "富士吉田市", en: "Fujiyoshida" }, { jp: "都留市", en: "Tsuru" },
        { jp: "山梨市", en: "Yamanashi" }, { jp: "大月市", en: "Otsuki" }, { jp: "韮崎市", en: "Nirasaki" },
        { jp: "南アルプス市", en: "Minami-Alps" }, { jp: "北杜市", en: "Hokuto" }, { jp: "甲斐市", en: "Kai" },
        { jp: "笛吹市", en: "Fuefuki" }, { jp: "上野原市", en: "Uenohara" }, { jp: "甲州市", en: "Koshu" },
        { jp: "中央市", en: "Chuo" }
    ],
    "長野県": [
        { jp: "長野市", en: "Nagano" }, { jp: "松本市", en: "Matsumoto" }, { jp: "上田市", en: "Ueda" },
        { jp: "岡谷市", en: "Okaya" }, { jp: "飯田市", en: "Iida" }, { jp: "諏訪市", en: "Suwa" },
        { jp: "須坂市", en: "Suzaka" }, { jp: "小諸市", en: "Komoro" }, { jp: "伊那市", en: "Ina" },
        { jp: "駒ヶ根市", en: "Komagane" }, { jp: "中野市", en: "Nakano" }, { jp: "大町市", en: "Omachi" },
        { jp: "飯山市", en: "Iiyama" }, { jp: "茅野市", en: "Chino" }, { jp: "塩尻市", en: "Shiojiri" },
        { jp: "千曲市", en: "Chikuma" }, { jp: "東御市", en: "Tomi" }, { jp: "安曇野市", en: "Azumino" }
    ],
    "岐阜県": [
        { jp: "岐阜市", en: "Gifu" }, { jp: "大垣市", en: "Ogaki" }, { jp: "高山市", en: "Takayama" },
        { jp: "多治見市", en: "Tajimi" }, { jp: "関市", en: "Seki" }, { jp: "中津川市", en: "Nakatsugawa" },
        { jp: "美濃市", en: "Mino" }, { jp: "瑞浪市", en: "Mizunami" }, { jp: "羽島市", en: "Hashima" },
        { jp: "恵那市", en: "Ena" }, { jp: "美濃加茂市", en: "Minokamo" }, { jp: "土岐市", en: "Toki" },
        { jp: "各務原市", en: "Kakamigahara" }, { jp: "可児市", en: "Kani" }, { jp: "山県市", en: "Yamagata" },
        { jp: "瑞穂市", en: "Mizuho" }, { jp: "飛騨市", en: "Hida" }, { jp: "本巣市", en: "Motosu" },
        { jp: "郡上市", en: "Gujo" }, { jp: "下呂市", en: "Gero" }, { jp: "海津市", en: "Kaizu" }
    ],
    "静岡県": [
        { jp: "静岡市", en: "Shizuoka" }, { jp: "浜松市", en: "Hamamatsu" }, { jp: "沼津市", en: "Numazu" },
        { jp: "熱海市", en: "Atami" }, { jp: "三島市", en: "Mishima" }, { jp: "富士宮市", en: "Fujinomiya" },
        { jp: "伊東市", en: "Ito" }, { jp: "島田市", en: "Shimada" }, { jp: "富士市", en: "Fuji" },
        { jp: "磐田市", en: "Iwata" }, { jp: "焼津市", en: "Yaizu" }, { jp: "掛川市", en: "Kakegawa" },
        { jp: "藤枝市", en: "Fujieda" }, { jp: "御殿場市", en: "Gotemba" }, { jp: "袋井市", en: "Fukuroi" },
        { jp: "下田市", en: "Shimoda" }, { jp: "裾野市", en: "Susono" }, { jp: "湖西市", en: "Kosai" },
        { jp: "伊豆市", en: "Izu" }, { jp: "御前崎市", en: "Omaezaki" }, { jp: "菊川市", en: "Kikugawa" },
        { jp: "伊豆の国市", en: "Izunokuni" }, { jp: "牧之原市", en: "Makinohara" }
    ],
    "愛知県": [
        { jp: "名古屋市", en: "Nagoya" }, { jp: "豊橋市", en: "Toyohashi" }, { jp: "岡崎市", en: "Okazaki" },
        { jp: "一宮市", en: "Ichinomiya" }, { jp: "瀬戸市", en: "Seto" }, { jp: "半田市", en: "Handa" },
        { jp: "春日井市", en: "Kasugai" }, { jp: "豊川市", en: "Toyokawa" }, { jp: "津島市", en: "Tsushima" },
        { jp: "碧南市", en: "Hekinan" }, { jp: "刈谷市", en: "Kariya" }, { jp: "豊田市", en: "Toyota" },
        { jp: "安城市", en: "Anjo" }, { jp: "西尾市", en: "Nishio" }, { jp: "蒲郡市", en: "Gamagori" },
        { jp: "犬山市", en: "Inuyama" }, { jp: "常滑市", en: "Tokoname" }, { jp: "江南市", en: "Konan" },
        { jp: "小牧市", en: "Komaki" }, { jp: "稲沢市", en: "Inazawa" }, { jp: "新城市", en: "Shinshiro" },
        { jp: "東海市", en: "Tokai" }, { jp: "大府市", en: "Obu" }, { jp: "知多市", en: "Chita" },
        { jp: "知立市", en: "Chiryu" }, { jp: "尾張旭市", en: "Owariasahi" }, { jp: "高浜市", en: "Takahama" },
        { jp: "岩倉市", en: "Iwakura" }, { jp: "豊明市", en: "Toyoake" }, { jp: "日進市", en: "Nisshin" },
        { jp: "田原市", en: "Tahara" }, { jp: "愛西市", en: "Aisai" }, { jp: "清須市", en: "Kiyosu" },
        { jp: "北名古屋市", en: "Kitanagoya" }, { jp: "弥富市", en: "Yatomi" }, { jp: "みよし市", en: "Miyoshi" },
        { jp: "あま市", en: "Ama" }, { jp: "長久手市", en: "Nagakute" }
    ],
    "三重県": [
        { jp: "津市", en: "Tsu" }, { jp: "四日市市", en: "Yokkaichi" }, { jp: "伊勢市", en: "Ise" },
        { jp: "松阪市", en: "Matsusaka" }, { jp: "桑名市", en: "Kuwana" }, { jp: "鈴鹿市", en: "Suzuka" },
        { jp: "名張市", en: "Nabari" }, { jp: "尾鷲市", en: "Owase" }, { jp: "亀山市", en: "Kameyama" },
        { jp: "鳥羽市", en: "Toba" }, { jp: "熊野市", en: "Kumano" }, { jp: "いなべ市", en: "Inabe" },
        { jp: "志摩市", en: "Shima" }, { jp: "伊賀市", en: "Iga" }
    ],
    "滋賀県": [
        { jp: "大津市", en: "Otsu" }, { jp: "彦根市", en: "Hikone" }, { jp: "長浜市", en: "Nagahama" },
        { jp: "近江八幡市", en: "Omihachiman" }, { jp: "草津市", en: "Kusatsu" }, { jp: "守山市", en: "Moriyama" },
        { jp: "栗東市", en: "Ritto" }, { jp: "甲賀市", en: "Koka" }, { jp: "野洲市", en: "Yasu" },
        { jp: "湖南市", en: "Konan" }, { jp: "高島市", en: "Takashima" }, { jp: "東近江市", en: "Higashiomi" },
        { jp: "米原市", en: "Maibara" }
    ],
    "京都府": [
        { jp: "京都市", en: "Kyoto" }, { jp: "福知山市", en: "Fukuchiyama" }, { jp: "舞鶴市", en: "Maizuru" },
        { jp: "綾部市", en: "Ayabe" }, { jp: "宇治市", en: "Uji" }, { jp: "宮津市", en: "Miyazu" },
        { jp: "亀岡市", en: "Kameoka" }, { jp: "城陽市", en: "Joyo" }, { jp: "向日市", en: "Muko" },
        { jp: "長岡京市", en: "Nagaokakyo" }, { jp: "八幡市", en: "Yawata" }, { jp: "京田辺市", en: "Kyotanabe" },
        { jp: "京丹後市", en: "Kyotango" }, { jp: "南丹市", en: "Nantan" }, { jp: "木津川市", en: "Kizugawa" }
    ],
    "大阪府": [
        { jp: "大阪市", en: "Osaka" }, { jp: "堺市", en: "Sakai" }, { jp: "岸和田市", en: "Kishiwada" },
        { jp: "豊中市", en: "Toyonaka" }, { jp: "池田市", en: "Ikeda" }, { jp: "吹田市", en: "Suita" },
        { jp: "泉大津市", en: "Izumiotsu" }, { jp: "高槻市", en: "Takatsuki" }, { jp: "貝塚市", en: "Kaizuka" },
        { jp: "守口市", en: "Moriguchi" }, { jp: "枚方市", en: "Hirakata" }, { jp: "茨木市", en: "Ibaraki" },
        { jp: "八尾市", en: "Yao" }, { jp: "泉佐野市", en: "Izumisano" }, { jp: "富田林市", en: "Tondabayashi" },
        { jp: "寝屋川市", en: "Neyagawa" }, { jp: "河内長野市", en: "Kawachinagano" }, { jp: "松原市", en: "Matsubara" },
        { jp: "大東市", en: "Daito" }, { jp: "和泉市", en: "Izumi" }, { jp: "箕面市", en: "Minoh" },
        { jp: "柏原市", en: "Kashiwara" }, { jp: "羽曳野市", en: "Habikino" }, { jp: "門真市", en: "Kadoma" },
        { jp: "摂津市", en: "Settsu" }, { jp: "高石市", en: "Takaishi" }, { jp: "藤井寺市", en: "Fujiidera" },
        { jp: "東大阪市", en: "Higashiosaka" }, { jp: "泉南市", en: "Sennan" }, { jp: "四條畷市", en: "Shijonawate" },
        { jp: "交野市", en: "Katano" }, { jp: "大阪狭山市", en: "Osakasayama" }, { jp: "阪南市", en: "Hannan" }
    ],
    "兵庫県": [
        { jp: "神戸市", en: "Kobe" }, { jp: "姫路市", en: "Himeji" }, { jp: "尼崎市", en: "Amagasaki" },
        { jp: "明石市", en: "Akashi" }, { jp: "西宮市", en: "Nishinomiya" }, { jp: "洲本市", en: "Sumoto" },
        { jp: "芦屋市", en: "Ashiya" }, { jp: "伊丹市", en: "Itami" }, { jp: "相生市", en: "Aioi" },
        { jp: "豊岡市", en: "Toyooka" }, { jp: "加古川市", en: "Kakogawa" }, { jp: "赤穂市", en: "Ako" },
        { jp: "西脇市", en: "Nishiwaki" }, { jp: "宝塚市", en: "Takarazuka" }, { jp: "三木市", en: "Miki" },
        { jp: "高砂市", en: "Takasago" }, { jp: "川西市", en: "Kawanishi" }, { jp: "小野市", en: "Ono" },
        { jp: "三田市", en: "Sanda" }, { jp: "加西市", en: "Kasai" }, { jp: "丹波篠山市", en: "Tambasasayama" },
        { jp: "養父市", en: "Yabu" }, { jp: "丹波市", en: "Tamba" }, { jp: "南あわじ市", en: "Minamiawaji" },
        { jp: "朝来市", en: "Asago" }, { jp: "淡路市", en: "Awaji" }, { jp: "宍粟市", en: "Shiso" },
        { jp: "加東市", en: "Kato" }, { jp: "たつの市", en: "Tatsuno" }
    ],
    "奈良県": [
        { jp: "奈良市", en: "Nara" }, { jp: "大和高田市", en: "Yamatotakada" }, { jp: "大和郡山市", en: "Yamatokoriyama" },
        { jp: "天理市", en: "Tenri" }, { jp: "橿原市", en: "Kashihara" }, { jp: "桜井市", en: "Sakurai" },
        { jp: "五條市", en: "Gojo" }, { jp: "御所市", en: "Gose" }, { jp: "生駒市", en: "Ikoma" },
        { jp: "香芝市", en: "Kashiba" }, { jp: "葛城市", en: "Katsuragi" }, { jp: "宇陀市", en: "Uda" }
    ],
    "和歌山県": [
        { jp: "和歌山市", en: "Wakayama" }, { jp: "海南市", en: "Kainan" }, { jp: "橋本市", en: "Hashimoto" },
        { jp: "有田市", en: "Arida" }, { jp: "御坊市", en: "Gobo" }, { jp: "田辺市", en: "Tanabe" },
        { jp: "新宮市", en: "Shingu" }, { jp: "紀の川市", en: "Kinokawa" }, { jp: "岩出市", en: "Iwade" }
    ],
    "鳥取県": [
        { jp: "鳥取市", en: "Tottori" }, { jp: "米子市", en: "Yonago" }, { jp: "倉吉市", en: "Kurayoshi" },
        { jp: "境港市", en: "Sakaiminato" }
    ],
    "島根県": [
        { jp: "松江市", en: "Matsue" }, { jp: "浜田市", en: "Hamada" }, { jp: "出雲市", en: "Izumo" },
        { jp: "益田市", en: "Masuda" }, { jp: "大田市", en: "Oda" }, { jp: "安来市", en: "Yasugi" },
        { jp: "江津市", en: "Gotsu" }, { jp: "雲南市", en: "Unnan" }
    ],
    "岡山県": [
        { jp: "岡山市", en: "Okayama" }, { jp: "倉敷市", en: "Kurashiki" }, { jp: "津山市", en: "Tsuyama" },
        { jp: "玉野市", en: "Tamano" }, { jp: "笠岡市", en: "Kasaoka" }, { jp: "井原市", en: "Ibara" },
        { jp: "総社市", en: "Soja" }, { jp: "高梁市", en: "Takahashi" }, { jp: "新見市", en: "Niimi" },
        { jp: "備前市", en: "Bizen" }, { jp: "瀬戸内市", en: "Setouchi" }, { jp: "赤磐市", en: "Akaiwa" },
        { jp: "真庭市", en: "Maniwa" }, { jp: "美作市", en: "Mimasaka" }, { jp: "浅口市", en: "Asakuchi" }
    ],
    "広島県": [
        { jp: "広島市", en: "Hiroshima" }, { jp: "呉市", en: "Kure" }, { jp: "竹原市", en: "Takehara" },
        { jp: "三原市", en: "Mihara" }, { jp: "尾道市", en: "Onomichi" }, { jp: "福山市", en: "Fukuyama" },
        { jp: "府中市", en: "Fuchu" }, { jp: "三次市", en: "Miyoshi" }, { jp: "庄原市", en: "Shobara" },
        { jp: "大竹市", en: "Otake" }, { jp: "東広島市", en: "Higashihiroshima" }, { jp: "廿日市市", en: "Hatsukaichi" },
        { jp: "安芸高田市", en: "Akitakata" }, { jp: "江田島市", en: "Etajima" }
    ],
    "山口県": [
        { jp: "下関市", en: "Shimonoseki" }, { jp: "宇部市", en: "Ube" }, { jp: "山口市", en: "Yamaguchi" },
        { jp: "萩市", en: "Hagi" }, { jp: "防府市", en: "Hofu" }, { jp: "下松市", en: "Kudamatsu" },
        { jp: "岩国市", en: "Iwakuni" }, { jp: "光市", en: "Hikari" }, { jp: "長門市", en: "Nagato" },
        { jp: "柳井市", en: "Yanai" }, { jp: "美祢市", en: "Mine" }, { jp: "周南市", en: "Shunan" },
        { jp: "山陽小野田市", en: "Sanyo-Onoda" }
    ],
    "徳島県": [
        { jp: "徳島市", en: "Tokushima" }, { jp: "鳴門市", en: "Naruto" }, { jp: "小松島市", en: "Komatsushima" },
        { jp: "阿南市", en: "Anan" }, { jp: "吉野川市", en: "Yoshinogawa" }, { jp: "阿波市", en: "Awa" },
        { jp: "美馬市", en: "Mima" }, { jp: "三好市", en: "Miyoshi" }
    ],
    "香川県": [
        { jp: "高松市", en: "Takamatsu" }, { jp: "丸亀市", en: "Marugame" }, { jp: "坂出市", en: "Sakaide" },
        { jp: "善通寺市", en: "Zentsuji" }, { jp: "観音寺市", en: "Kanonji" }, { jp: "さぬき市", en: "Sanuki" },
        { jp: "東かがわ市", en: "Higashikagawa" }, { jp: "三豊市", en: "Mitoyo" }
    ],
    "愛媛県": [
        { jp: "松山市", en: "Matsuyama" }, { jp: "今治市", en: "Imabari" }, { jp: "宇和島市", en: "Uwajima" },
        { jp: "八幡浜市", en: "Yawatahama" }, { jp: "新居浜市", en: "Niihama" }, { jp: "西条市", en: "Saijo" },
        { jp: "大洲市", en: "Ozu" }, { jp: "伊予市", en: "Iyo" }, { jp: "四国中央市", en: "Shikokuchuo" },
        { jp: "西予市", en: "Seiyo" }, { jp: "東温市", en: "Toon" }
    ],
    "高知県": [
        { jp: "高知市", en: "Kochi" }, { jp: "室戸市", en: "Muroto" }, { jp: "安芸市", en: "Aki" },
        { jp: "南国市", en: "Nankoku" }, { jp: "土佐市", en: "Tosa" }, { jp: "須崎市", en: "Susaki" },
        { jp: "宿毛市", en: "Sukumo" }, { jp: "土佐清水市", en: "Tosashimizu" }, { jp: "四万十市", en: "Shimanto" },
        { jp: "香南市", en: "Konan" }, { jp: "香美市", en: "Kami" }
    ],
    "福岡県": [
        { jp: "北九州市", en: "Kitakyushu" }, { jp: "福岡市", en: "Fukuoka" }, { jp: "大牟田市", en: "Omuta" },
        { jp: "久留米市", en: "Kurume" }, { jp: "直方市", en: "Nogata" }, { jp: "飯塚市", en: "Iizuka" },
        { jp: "田川市", en: "Tagawa" }, { jp: "柳川市", en: "Yanagawa" }, { jp: "八女市", en: "Yame" },
        { jp: "筑後市", en: "Chikugo" }, { jp: "大川市", en: "Okawa" }, { jp: "行橋市", en: "Yukuhashi" },
        { jp: "豊前市", en: "Buzen" }, { jp: "中間市", en: "Nakama" }, { jp: "小郡市", en: "Ogori" },
        { jp: "筑紫野市", en: "Chikushino" }, { jp: "春日市", en: "Kasuga" }, { jp: "大野城市", en: "Onojo" },
        { jp: "宗像市", en: "Munakata" }, { jp: "太宰府市", en: "Dazaifu" }, { jp: "古賀市", en: "Koga" },
        { jp: "福津市", en: "Fukutsu" }, { jp: "うきは市", en: "Ukiha" }, { jp: "宮若市", en: "Miyawaka" },
        { jp: "嘉麻市", en: "Kama" }, { jp: "朝倉市", en: "Asakura" }, { jp: "みやま市", en: "Miyama" },
        { jp: "糸島市", en: "Itoshima" }, { jp: "那珂川市", en: "Nakagawa" }
    ],
    "佐賀県": [
        { jp: "佐賀市", en: "Saga" }, { jp: "唐津市", en: "Karatsu" }, { jp: "鳥栖市", en: "Tosu" },
        { jp: "多久市", en: "Taku" }, { jp: "伊万里市", en: "Imari" }, { jp: "武雄市", en: "Takeo" },
        { jp: "鹿島市", en: "Kashima" }, { jp: "小城市", en: "Ogi" }, { jp: "嬉野市", en: "Ureshino" },
        { jp: "神埼市", en: "Kanzaki" }
    ],
    "長崎県": [
        { jp: "長崎市", en: "Nagasaki" }, { jp: "佐世保市", en: "Sasebo" }, { jp: "島原市", en: "Shimabara" },
        { jp: "諫早市", en: "Isahaya" }, { jp: "大村市", en: "Omura" }, { jp: "平戸市", en: "Hirado" },
        { jp: "松浦市", en: "Matsuura" }, { jp: "対馬市", en: "Tsushima" }, { jp: "壱岐市", en: "Iki" },
        { jp: "五島市", en: "Goto" }, { jp: "西海市", en: "Saikai" }, { jp: "雲仙市", en: "Unzen" },
        { jp: "南島原市", en: "Minamishimabara" }
    ],
    "熊本県": [
        { jp: "熊本市", en: "Kumamoto" }, { jp: "八代市", en: "Yatsushiro" }, { jp: "人吉市", en: "Hitoyoshi" },
        { jp: "荒尾市", en: "Arao" }, { jp: "水俣市", en: "Minamata" }, { jp: "玉名市", en: "Tamana" },
        { jp: "山鹿市", en: "Yamaga" }, { jp: "菊池市", en: "Kikuchi" }, { jp: "宇土市", en: "Uto" },
        { jp: "上天草市", en: "Kamiamakusa" }, { jp: "宇城市", en: "Uki" }, { jp: "阿蘇市", en: "Aso" },
        { jp: "天草市", en: "Amakusa" }, { jp: "合志市", en: "Koshi" }
    ],
    "大分県": [
        { jp: "大分市", en: "Oita" }, { jp: "別府市", en: "Beppu" }, { jp: "中津市", en: "Nakatsu" },
        { jp: "日田市", en: "Hita" }, { jp: "佐伯市", en: "Saiki" }, { jp: "臼杵市", en: "Usuki" },
        { jp: "津久見市", en: "Tsukumi" }, { jp: "竹田市", en: "Taketa" }, { jp: "豊後高田市", en: "Bungotakada" },
        { jp: "杵築市", en: "Kitsuki" }, { jp: "宇佐市", en: "Usa" }, { jp: "豊後大野市", en: "Bungo-Ono" },
        { jp: "由布市", en: "Yufu" }, { jp: "国東市", en: "Kunisaki" }
    ],
    "宮崎県": [
        { jp: "宮崎市", en: "Miyazaki" }, { jp: "都城市", en: "Miyakonojo" }, { jp: "延岡市", en: "Nobeoka" },
        { jp: "日南市", en: "Nichinan" }, { jp: "小林市", en: "Kobayashi" }, { jp: "日向市", en: "Hyuga" },
        { jp: "串間市", en: "Kushima" }, { jp: "西都市", en: "Saito" }, { jp: "えびの市", en: "Ebino" }
    ],
    "鹿児島県": [
        { jp: "鹿児島市", en: "Kagoshima" }, { jp: "鹿屋市", en: "Kanoya" }, { jp: "枕崎市", en: "Makurazaki" },
        { jp: "阿久根市", en: "Akune" }, { jp: "出水市", en: "Izumi" }, { jp: "指宿市", en: "Ibusuki" },
        { jp: "西之表市", en: "Nishinoomote" }, { jp: "垂水市", en: "Tarumizu" }, { jp: "薩摩川内市", en: "Satsumasendai" },
        { jp: "日置市", en: "Hioki" }, { jp: "曽於市", en: "Soo" }, { jp: "霧島市", en: "Kirishima" },
        { jp: "いちき串木野市", en: "Ichikikushikino" }, { jp: "南さつま市", en: "Minamisatsuma" },
        { jp: "志布志市", en: "Shibushi" }, { jp: "奄美市", en: "Amami" }, { jp: "南九州市", en: "Minamikyushu" },
        { jp: "伊佐市", en: "Isa" }, { jp: "姶良市", en: "Aira" }
    ],
    "沖縄県": [
        { jp: "那覇市", en: "Naha" }, { jp: "宜野湾市", en: "Ginowan" }, { jp: "石垣市", en: "Ishigaki" },
        { jp: "浦添市", en: "Urasoe" }, { jp: "名護市", en: "Nago" }, { jp: "糸満市", en: "Itoman" },
        { jp: "沖縄市", en: "Okinawa" }, { jp: "豊見城市", en: "Tomigusuku" }, { jp: "うるま市", en: "Uruma" },
        { jp: "宮古島市", en: "Miyakojima" }, { jp: "南城市", en: "Nanjo" }
    ]
};

export const travelPlaceholders = [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e", // Temple/Architecture
    "https://images.unsplash.com/photo-1528127269322-539801943592", // Nature/Vietnam
    "https://images.unsplash.com/photo-1533929736458-ca588d08c8be", // City/London
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1", // Mountain/Lake
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb", // Landscape/Dolomites
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470", // Sunset/Lake
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a", // Paris/City
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b", // Mountains
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee", // Road/Car
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Tropical/Beach
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", // Nature/Fog
    "https://images.unsplash.com/photo-1447752875204-dad4151b06e3", // Autumn/Forest
    "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4", // Food/Dining
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9", // Venice/Canal
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800", // Roadtrip/Van
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8", // Coffee/Cafe
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0", // Travel/Map
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828", // Train/Travel
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963", // Cinque Terre
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e", // Mountain/View
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34", // Paris/Eiffel
    "https://images.unsplash.com/photo-1504150558240-0b4fd8946624", // Airport/Travel
    "https://images.unsplash.com/photo-1488085061387-422e29b40080", // Suitcase/Travel
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff", // Hiking/Mountain
    "https://images.unsplash.com/photo-1504593811423-6dd665756598", // Kyoto/Japan
    "https://images.unsplash.com/photo-1524613032530-449a5d94c285", // Cherry Blossoms
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989", // Shibuya/Crossing
    "https://images.unsplash.com/photo-1480796927426-f609979314bd", // Tokyo/City
    "https://images.unsplash.com/photo-1492571350019-22de08371fd3"  // Japanese Garden
];

/**
 * Returns a stable placeholder image from a fixed set based on an ID.
 * If no ID is provided, returns a random image from the set.
 */
export const getPlaceholderImage = (id?: string | number): string => {
    if (!id) {
        const randomIndex = Math.floor(Math.random() * travelPlaceholders.length);
        return travelPlaceholders[randomIndex];
    }

    const idStr = String(id);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = ((hash << 5) - hash) + idStr.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % travelPlaceholders.length;
    return travelPlaceholders[index];
};
