// 文物数据
export const heritageList = [
  {
    id: 1,
    name: "晋祠圣母殿",
    category: "古代建筑",
    description: "晋祠圣母殿是中国山西省太原市晋源区晋祠镇的著名古建筑，始建于北宋熙宁七年（1074年），是中国现存最早的宋代木结构建筑之一。殿堂建筑布局严谨，工艺精湛，是中国古代木结构建筑的经典代表作。殿内主要供奉的是晋水女神，被誉为"艺术的宝库、建筑的瑰宝"。",
    image: "/static/spot-default.png",
    extraImages: [
      "/static/spot-default.png",
      "/static/spot-default.png",
      "/static/spot-default.png"
    ],
    address: "山西省太原市晋源区晋祠镇",
    age: "北宋（1074年）",
    rating: 4.8,
    popularity: 96,
    latitude: 37.708904,
    longitude: 112.434296,
    features: ["宋代建筑风格", "彩塑艺术", "历史悠久"]
  },
  {
    id: 2,
    name: "应县木塔",
    category: "古代建筑",
    description: "应县木塔又称佛宫寺释迦塔，位于山西省朔州市应县佛宫寺内，建于辽代清宁年间（1056年），是中国现存最高最古的木构塔式建筑，也是世界上现存最高的全木结构古建筑。塔高67.31米，共五层八面，呈密檐式，塔内设有盘旋而上的楼梯，可登至顶层。整座木塔不用一钉一铆，全靠榫卯结构连接，展现了中国古代木结构建筑技术的高超智慧。",
    image: "/static/spot-default.png",
    extraImages: [
      "/static/spot-default.png",
      "/static/spot-default.png"
    ],
    address: "山西省朔州市应县城东北佛宫寺内",
    age: "辽代（1056年）",
    rating: 4.9,
    popularity: 98,
    latitude: 39.554561,
    longitude: 113.187607,
    features: ["辽代建筑", "榫卯结构", "佛教艺术"]
  },
  {
    id: 3,
    name: "平遥古城",
    category: "历史街区",
    description: "平遥古城位于山西省晋中市平遥县，是中国保存最为完整的四大古城之一，也是世界文化遗产。始建于西周时期，现存的城墙建于明代洪武三年（1370年）。古城呈方形，面积约2.25平方公里，城墙周长6.4公里，高12米，有城门六座，角楼四座，敌楼72座。城内保存了大量明清时期的民居、店铺、寺庙等建筑，街道布局呈'土'字形。平遥是晚清时期中国的金融中心，中国第一家票号'日升昌'就诞生于此。",
    image: "/static/spot-default.png",
    extraImages: [
      "/static/spot-default.png",
      "/static/spot-default.png",
      "/static/spot-default.png"
    ],
    address: "山西省晋中市平遥县",
    age: "明代（保存至今）",
    rating: 4.7,
    popularity: 95,
    latitude: 37.201266,
    longitude: 112.174349,
    features: ["古城墙", "明清建筑群", "传统街区"]
  },
  {
    id: 4,
    name: "云冈石窟",
    category: "石窟艺术",
    description: "云冈石窟位于山西省大同市西郊武周山北麓，始凿于北魏文成帝时期（约460年），是中国四大石窟之一，也是世界文化遗产。石窟沿山开凿，东西绵延约1公里，现存主要洞窟45个，大小窟龛252个，石雕造像51000余尊，最大的佛像高达17米。云冈石窟的艺术风格融合了中国汉族传统艺术、中亚和印度佛教艺术的特点，反映了中国北方少数民族与汉族文化交融的历史，是中国佛教石窟艺术的巅峰之作。",
    image: "/static/spot-default.png",
    extraImages: [
      "/static/spot-default.png",
      "/static/spot-default.png"
    ],
    address: "山西省大同市云冈区云冈镇",
    age: "北魏（460年-524年）",
    rating: 4.9,
    popularity: 97,
    latitude: 40.110764,
    longitude: 113.132103,
    features: ["佛教石窟", "北魏雕刻", "世界遗产"]
  },
  {
    id: 5,
    name: "王家大院",
    category: "民居建筑",
    description: "王家大院位于山西省晋中市灵石县静升镇，是清代著名的晋商王家的宅院，也是山西民居建筑的代表作。大院始建于清代乾隆年间，历经多次扩建，现存建筑群占地约25万平方米，有房屋231间。大院采用'三堂一照壁五进院'的传统布局，体现了中国传统的'礼制建筑'特点。院内雕刻、彩绘、砖雕、石雕等装饰艺术精湛，是研究晋商文化和民居建筑的重要实物资料。",
    image: "/static/spot-default.png",
    extraImages: [
      "/static/spot-default.png",
      "/static/spot-default.png"
    ],
    address: "山西省晋中市灵石县静升镇",
    age: "清代（1762年-1811年）",
    rating: 4.6,
    popularity: 92,
    latitude: 36.847755,
    longitude: 111.772507,
    features: ["晋商民居", "清代建筑", "传统装饰艺术"]
  },
  {
    id: 6,
    name: "悬空寺",
    category: "古代建筑",
    description: "悬空寺位于山西省大同市浑源县恒山金龙峡西侧翠屏峰的峭壁上，始建于北魏后期（约1500年前），是国家重点文物保护单位。寺庙依山势而建，多为木结构，主体建筑紧贴着悬崖峭壁，平均海拔高约50米，建筑面积约152.5平方米。寺内供奉佛、道、儒三教，是中国罕见的三教合一的寺庙。整座建筑看似摇摇欲坠，实则坚固异常，被誉为'世界建筑奇观'。",
    image: "/static/spot-default.png",
    extraImages: [
      "/static/spot-default.png",
      "/static/spot-default.png"
    ],
    address: "山西省大同市浑源县恒山金龙峡",
    age: "北魏后期（约公元491年）",
    rating: 4.8,
    popularity: 96,
    latitude: 39.6672,
    longitude: 113.7026,
    features: ["悬崖建筑", "三教合一", "结构独特"]
  }
];

// 替代图片，防止路径不存在导致的错误
const fallbackImage = "/static/spot-default.png";

// 处理图片加载失败
export function getFallbackImage() {
  return fallbackImage;
} 