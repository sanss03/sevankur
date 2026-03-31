export const T = {
  en:{
    tagline:"Smart Governance Made Simple",
    login:"Login", signup:"Sign Up", name:"Full Name", empId:"Employee ID",
    email:"Email", password:"Password", role:"Role", admin:"Admin", officer:"Officer",
    chat:"Chat", dashboard:"Dashboard", defaulters:"Defaulters", reports:"Reports",
    ward:"Ward", zone:"Zone", genNotice:"Generate Notice", dlReport:"Download Report",
    searchProp:"Search property or owner…", systemOnline:"System Online",
    aiActive:"AI Active", offline:"Low Connectivity", activityLog:"Activity Log",
    notifications:"Notifications", greeting:"Namaste! How can I assist you today?",
    placeholder:"Ask about defaulters, dues, payments…", send:"Send",
    noAccount:"Don't have an account?", hasAccount:"Already have an account?",
    welcome:"Welcome back, officer", createAcc:"Create your officer account",
    taxCalculator:"Tax Calculator",
  },
  hi:{
    tagline:"स्मार्ट शासन, सरल तरीके से",
    login:"लॉगिन", signup:"साइन अप", name:"पूरा नाम", empId:"कर्मचारी ID",
    email:"ईमेल", password:"पासवर्ड", role:"भूमिका", admin:"व्यवस्थापक", officer:"अधिकारी",
    chat:"चैट", dashboard:"डैशबोर्ड", defaulters:"चूककर्ता", reports:"रिपोर्ट",
    ward:"वार्ड", zone:"क्षेत्र", genNotice:"नोटिस बनाएं", dlReport:"रिपोर्ट डाउनलोड",
    searchProp:"संपत्ति या मालिक खोजें…", systemOnline:"सिस्टम ऑनलाइन",
    aiActive:"AI सक्रिय", offline:"कम कनेक्टिविटी", activityLog:"गतिविधि लॉग",
    notifications:"सूचनाएं", greeting:"नमस्ते! आज मैं आपकी कैसे सहायता कर सकता हूं?",
    placeholder:"चूककर्ता, बकाया, भुगतान के बारे में पूछें…", send:"भेजें",
    noAccount:"खाता नहीं है?", hasAccount:"पहले से खाता है?",
    welcome:"वापस स्वागत है, अधिकारी", createAcc:"अपना खाता बनाएं",
    taxCalculator:"कर कैलकुलेटर",
  },
  mr:{
    tagline:"स्मार्ट शासन, सोप्या पद्धतीने",
    login:"लॉगिन", signup:"साइन अप", name:"पूर्ण नाव", empId:"कर्मचारी ID",
    email:"ईमेल", password:"पासवर्ड", role:"भूमिका", admin:"प्रशासक", officer:"अधिकारी",
    chat:"चॅट", dashboard:"डॅशबोर्ड", defaulters:"थकबाकीदार", reports:"अहवाल",
    ward:"वार्ड", zone:"झोन", genNotice:"नोटीस तयार करा", dlReport:"अहवाल डाउनलोड",
    searchProp:"मालमत्ता किंवा मालक शोधा…", systemOnline:"सिस्टम ऑनलाइन",
    aiActive:"AI सक्रिय", offline:"कमी कनेक्टिव्हिटी", activityLog:"क्रियाकलाप लॉग",
    notifications:"सूचना", greeting:"नमस्कार! आज मी आपली कशी मदत करू?",
    placeholder:"थकबाकीदार, देय, देयके याबद्दल विचारा…", send:"पाठवा",
    noAccount:"खाते नाही?", hasAccount:"आधीच खाते आहे?",
    welcome:"परत स्वागत है, अधिकारी", createAcc:"आपले खाते तयार करा",
    taxCalculator:"कर कॅल्क्युलेटर",
  }
};

export const SAMPLE = {
  defaulter:{
    text:"Found 47 defaulters in Ward 5, Zone A. Here are the top overdue cases:",
    table:[
      {uid:"MH-WD5-1002",owner:"Rekha Kulkarni",dues:"₹18,450",years:2,status:"defaulter"},
      {uid:"MH-WD5-1007",owner:"Suresh Pawar",dues:"₹12,300",years:1,status:"defaulter"},
      {uid:"MH-WD5-1014",owner:"Anita Deshmukh",dues:"₹9,750",years:3,status:"defaulter"},
      {uid:"MH-WD5-1021",owner:"Ramesh More",dues:"₹7,200",years:1,status:"defaulter"},
    ]
  },
  payment:{
    text:"Payment status for Property MH-WD3-1001 (Sanjay Kale):",
    table:[
      {year:"2024 H1",due:"₹16,800",paid:"₹16,800",status:"paid",date:"15 Jun 2024"},
      {year:"2023 H2",due:"₹16,800",paid:"₹16,800",status:"paid",date:"10 Dec 2023"},
      {year:"2023 H1",due:"₹16,800",paid:"₹8,400",status:"partial",date:"20 Jul 2023"},
    ]
  },
  collection:{
    text:"Tax collection summary for 2024 by ward:",
    chart:[
      {ward:"Ward 1",collected:82},{ward:"Ward 2",collected:67},
      {ward:"Ward 3",collected:91},{ward:"Ward 4",collected:45},{ward:"Ward 5",collected:73},
    ]
  }
};

export const ACTIVITY=[
  {time:"10:32 AM",action:"Queried defaulters in Ward 5",user:"Admin"},
  {time:"10:18 AM",action:"Downloaded Q2 collection report",user:"Officer Ramesh"},
  {time:"09:55 AM",action:"Sent notice to MH-WD3-1002",user:"Admin"},
  {time:"09:41 AM",action:"Updated payment for MH-WD1-1001",user:"Officer Suresh"},
  {time:"09:20 AM",action:"Generated defaulter list — Ward 2",user:"Admin"},
];

export const NOTIFS=[
  {id:1,type:"warning",msg:"High dues in Ward 3 — ₹4.2L outstanding",time:"2h ago"},
  {id:2,type:"alert",  msg:"Defaulter count increased by 12 this week",time:"5h ago"},
  {id:3,type:"info",   msg:"Q2 2024 report is ready for download",time:"1d ago"},
  {id:4,type:"success",msg:"Ward 1 collection target 82% achieved",time:"1d ago"},
];
