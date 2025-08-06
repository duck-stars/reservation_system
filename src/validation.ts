import { FocusReason, QComboBox, QLabel, QLineEdit, QSpinBox, QTimeEdit } from "@nodegui/nodegui";
import fs from 'fs';
import jsonfile from 'jsonfile';

const validIdPrefixList = ["169", "170", "149", "150", "171", "168", "136", "137", "138", "545", "505", "636", "164", "165", "172", "623", "506", "519", "154", "155", "567", "173", "159", "160", "604", "274", "275", "295", "637", "292", "492", "289", "677", "294", "493", "279", "280", "288", "284", "285", "638", "291", "640", "293", "675", "282", "283", "286", "287", "296", "297", "290", "400", "401", "404", "405", "397", "398", "399", "647", "502", "584", "402", "403", "392", "393", "395", "396", "386", "387", "503", "444", "551", "447", "561", "445", "718", "83", "446", "448", "552", "543", "442", "443", "51", "052", "053", "58", "55", "617", "57", "618", "059", "060", "061", "062", "544", "56", "571", "593", "667", "348", "586", "338", "339", "343", "344", "346", "337", "554", "469", "537", "345", "470", "341", "342", "483", "484", "557", "418", "416", "417", "412", "413", "592", "612", "613", "406", "407", "421", "598", "419", "385", "420", "528", "213", "214", "205", "206", "498", "568", "711", "217", "218", "221", "582", "483", "625", "576", "578", "227", "208", "209", "225", "577", "712", "215", "216", "626", "627", "579", "713", "499", "222", "219", "220", "500", "501", "623", "497", "223", "689", "487", "226", "224", "486", "211", "212", "628", "202", "203", "531", "488", "261", "273", "630", "264", "518", "631", "258", "259", "570", "265", "268", "269", "653", "517", "569", "267", "262", "263", "593", "266", "693", "271", "272", "694", "270", "516", "333", "334", "691", "323", "322", "595", "395", "641", "596", "336", "335", "496", "337", "324", "325", "394", "330", "332", "331", "687", "422", "423", "599", "600", "688", "424", "425", "426", "550", "697", "384", "377", "378", "558", "385", "646", "375", "376", "372", "373", "379", "380", "383", "674", "381", "382", "676", "722", "542", "312", "313", "317", "310", "311", "302", "303", "583", "321", "382", "304", "305", "536", "605", "308", "309", "306", "307", "319", "313", "314", "606", "320", "698", "298", "299", "535", "315", "316", "318", "607", "608", "508", "538", "728", "509", "438", "439", "580", "590", "559", "588", "431", "432", "037", "038", "702", "240", "241", "670", "648", "252", "678", "253", "649", "513", "546", "671", "246", "247", "654", "548", "547", "655", "248", "249", "253", "514", "665", "673", "228", "229", "230", "679", "256", "257", "244", "245", "681", "723", "236", "237", "683", "656", "250", "251", "515", "242", "243", "238", "239", "657", "255", "684", "700", "642", "457", "456", "458", "459", "460", "530", "520", "358", "359", "682", "703", "364", "365", "371", "701", "720", "366", "367", "704", "361", "362", "369", "370", "635", "668", "533", "705", "699", "669", "725", "597", "611", "525", "181", "527", "585", "685", "663", "192", "193", "174", "175", "183", "184", "481", "706", "194", "195", "185", "186", "182", "199", "200", "198", "662", "190", "191", "692", "189", "707", "526", "187", "188", "729", "730", "196", "197", "661", "680", "643", "562", "572", "74", "644", "072", "073", "069", "070", "521", "573", "522", "724", "76", "77", "650", "574", "078", "079", "81", "84", "651", "086", "087", "089", "090", "553", "91", "092", "093", "094", "97", "98", "96", "105", "106", "63", "067", "068", "75", "591", "82", "635", "524", "468", "465", "461", "462", "467", "632", "555", "633", "629", "466", "696", "721", "064", "065", "523", "652", "719", "716", "85", "88", "563", "529", "353", "349", "350", "355", "609", "351", "352", "354", "732", "357", "532", "610", "356", "556", "658", "001", "002", "003", "004", "005", "006", "007", "008", "11", "20", "25", "15", "43", "666", "489", "044", "045", "048", "049", "490", "491", "695", "659", "031", "032", "664", "717", "041", "042", "471", "472", "454", "581", "449", "450", "616", "534", "455", "451", "726", "634", "453", "727", "452", "145", "146", "731", "690", "601", "504", "163", "714", "715", "566", "166", "167", "161", "162", "686", "603", "619", "118", "127", "128", "129", "620", "621", "549", "564", "575", "113", "114", "122", "540", "660", "120", "512", "510", "511", "119", "115", "112", "110", "111", "125", "126", "565", "121", "116", "117", "541", "622", "124", "108", "109", "123", "428", "427", "507", "158", "615", "152", "153"];

function validateIdCode(idField: QLineEdit, logsLabel: QLabel): boolean{
    if(idField.text().length === 0){
      logsLabel.setText(logsLabel.text() + "\n" + "خطا: کدملی را وارد نکرده اید");
      return false;
    }
    else if(idField.text().length !== 10){
        logsLabel.setText(logsLabel.text() + "\n" + "کد ملی باید 10 رقمی باشد");
        return false;
    }
    else if(!validIdPrefixList.includes(idField.text().substring(0, 3))){
        logsLabel.setText(logsLabel.text() + "\n" + "پیش شماره (سه حرف اول) کدملی نامعتبر است")
        return false;
    }
    else{
        return true;
    };
};

function validateFirstName(field: QLineEdit, logsLabel: QLabel): boolean{
  const filteredName = field.text().replace(/\s+/, "");
  if(filteredName === ""){
    logsLabel.setText(logsLabel.text() + "\n" + "خطا: نام کوچک را وارد نکرده اید");
    return false;
  }
  else{
    return true;
  };
};

function validateLastName(field: QLineEdit, logsLabel: QLabel): boolean{
  const filteredName = field.text().replace(/\s+/, "");
  if(filteredName === ""){
    logsLabel.setText(logsLabel.text() + "\n" + "خطا: نام خانوادگی را وارد نکرده اید");
    return false;
  }
  else{
    return true;
  };
};

function validateCallNumber(field: QLineEdit, logsLabel: QLabel): boolean{
  if(field.text() === ""){
    logsLabel.setText(logsLabel.text() + "\n" + "خطا: شماره موبایل را وارد نکرده اید");
    return false;
  }
  else if(field.text().length !== 11 ){
    logsLabel.setText(logsLabel.text() + "\n" + "خطا: شماره موبایل باید 11 رقمی باشد");
    return false;
  }
  else{
    return true;
  };
};

function validateAge(field: QLineEdit, logsLabel: QLabel): boolean{
  if(field.text() === ""){
    logsLabel.setText(logsLabel.text() + "\n" + "خطا: سن را وارد نکرده اید");
    return false;
  }
  else{
    return true;
  };
};

function getReservedTimes(filePath: string): string[]{
  const result: string[] = [];
  const data = jsonfile.readFileSync(filePath);
    for (const patient of data) {
      result.push(patient["Reserved Day"].toString() +
        patient["Reserved Month"].toString() +
        patient["Reserved Year"].toString() +
        patient["Reserved Time Minute"].toString() +
        patient["Reserved Time Hour"].toString()
      );
  };
  return result;
};

function validateInterference(filePath: string, dayField: QSpinBox, monthField: QComboBox,
  yearField: QSpinBox, timeField: QTimeEdit, logsLabel: QLabel): boolean{
    let reservedTimes = getReservedTimes(filePath);

    const day = dayField.value();
    const month = monthField.currentIndex();
    const year = yearField.value();
    const minute = timeField.time().minute();
    const hour = timeField.time().hour();
    const timeSignature = day.toString() + month.toString() + year.toString() +
    minute.toString() + hour.toString();


    if(reservedTimes.includes(timeSignature)){
      logsLabel.setText("خطا: این زمان قبلا رزرو شده است");
      return false;
    }
    else{
      return true;
    }
};


function filterPersian(field: QLineEdit): void{
  field.addEventListener("textChanged", (text) => {
    const filter1 = text.replace(/[^آابپتثجچحخدذرزژسشصضطظعغ فقکگلمنوهی]/, "");
    const filter2 = text.replace(/^ /, "")
    if (text !== filter1) {
      field.setText(filter1);
      }
    if (text !== filter2) {
      field.setText(filter2);
      }
  });
};

function filterNumber(field: QLineEdit): void{
  field.addEventListener("textChanged", (text) => {
    const filter1 = text.replace(/[^0-9]/g, "");
    if (text !== filter1) {
      field.setText(filter1);
      };
      })
  };

  function filterAge(field: QLineEdit): void{
  field.addEventListener("textChanged", (text) => {
    const filter1 = text.replace(/[^0-9]/g, "");
    const filter2 = text.replace(/^0/, "");
    if (text !== filter1) {
      field.setText(filter1);
      };
    if (text !== filter2) {
      field.setText(filter2);
      };
    });
  };


function filterCallNumber(field: QLineEdit): void{
  field.addEventListener("textChanged", (text) => {
    const filter1 = text.replace(/[^0-9]/g, "");
    const filter2 = text.replace(/^[^0]/, "");
    const filter3 = text.replace(/^0{1}[^9]/, "0");
    if (text !== filter1) {
      field.setText(filter1);
      };

    if (text !== filter2) {
      field.setText(filter2);
      };
      
    if (text !== filter3) {
      field.setText(filter3);
      };
  });
};

export {
    validateIdCode,
    validateFirstName,
    validateLastName,
    validateAge,
    validateCallNumber,
    validateInterference,
    filterPersian,
    filterNumber,
    filterCallNumber,
    filterAge,
};