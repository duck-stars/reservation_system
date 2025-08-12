import { QMainWindow, QWidget, QLabel, QPushButton, QBoxLayout, Direction, AlignmentFlag, 
  QFont, QListWidget, QListWidgetItem, QGridLayout, QLineEdit, QComboBox, QSpinBox, QTimeEdit, 
  QModelIndex, QTime, QWindow, QBrush, QColor } from '@nodegui/nodegui';

import fs from 'fs';
import * as path from "node:path";
import {months, correspondDays} from './calendar';
import {filterPersian, filterNumber, filterAge,
  filterCallNumber, validateIdCode, validateFirstName,
  validateLastName, validateAge, validateCallNumber,
  validateInterference} from './validation';

import {dataToObject, exportToJSON, getIdByItem,
   removeFromJSON, updateList, fillFields} from './storage';

import sourceMapSupport from 'source-map-support';

sourceMapSupport.install();


function main(): void {

  const databasePath = path.join(__dirname, "database.json");
  const databaseDirectory = __dirname;
  if(!fs.existsSync(databasePath)){
    // Ensure the directory exists
    if (!fs.existsSync(databaseDirectory)) {
      fs.mkdirSync(databaseDirectory, { recursive: true });
    }

    // Write "[]" to the file synchronously
    try {
      fs.writeFileSync(databasePath, '[]');
      console.log(`File created at ${databasePath} with content "[]"`);
    } catch (err) {
      console.error('Error writing file:', err);
    }
  }

  function getRandomId(): number {
      return Math.floor(Math.random() * (10000 - 10 + 1)) + 10;
    }
    
  function exportCustomer(ID?: number): void{
    const id = ID !== undefined ? ID : getRandomId()
    exportToJSON(databasePath,
      dataToObject(firstNameField, lastNameField, 
            genderField, ageField, callNumberField, 
            identityCodeField, dayField, monthField, 
            yearField, timeField, id)
            , logsLabel);
  };

  function removeAllExceptFirst(listWidget: QListWidget): void {
    const count = listWidget.count();

    // Start from the last item and go backwards to avoid index shifting
    for (let i = count - 1; i >= 1; i--) {
        listWidget.takeItem(i);
    }
}


  function disableGivenFields(...widgetsList: QWidget[]): void{
    for(const widget of widgetsList){
      widget.setDisabled(true);
      widget.setStyleSheet("QWidget[enabled=\"false\"] {color: #000000;}")
    }
  };

  function disableFields(): void{
    disableGivenFields(firstNameField, lastNameField, 
          genderField, ageField, callNumberField, 
          identityCodeField, dayField, monthField, 
          yearField, timeField)
  };

  function enableFields(...widgetsList: QWidget[]): void{
    for(const widget of widgetsList){
      widget.setDisabled(false);
    }
  };

  function clearFields(): void{
    firstNameField.setText("");
    lastNameField.setText("");
    genderField.setCurrentIndex(0);
    ageField.setText("");
    callNumberField.setText("");
    identityCodeField.setText("");
    dayField.setValue(1);
    monthField.setCurrentIndex(1);
    yearField.setValue(1404);

    const zeroTime = new QTime();
    zeroTime.setHMS(0,0,0);
    timeField.setTime(zeroTime);
  };

  let fieldsCache = [];
  let currentTimeSignature;
  function saveCache(): void{
    fieldsCache = [];
    fieldsCache.push(firstNameField.text());
    fieldsCache.push(lastNameField.text());
    fieldsCache.push(genderField.currentIndex());
    fieldsCache.push(ageField.text());
    fieldsCache.push(callNumberField.text());
    fieldsCache.push(identityCodeField.text());
    fieldsCache.push(dayField.value());
    fieldsCache.push(monthField.currentIndex());
    fieldsCache.push(yearField.value());
    fieldsCache.push(timeField.time());
  }

  function fillFromCache(fieldsCache): void{
    firstNameField.setText(fieldsCache[0]);
    lastNameField.setText(fieldsCache[1]);
    genderField.setCurrentIndex(fieldsCache[2]);
    ageField.setText(fieldsCache[3]);
    callNumberField.setText(fieldsCache[4]);
    identityCodeField.setText(fieldsCache[5]);
    dayField.setValue(fieldsCache[1]);
    monthField.setCurrentIndex(fieldsCache[6]);
    yearField.setValue(fieldsCache[7]);
    timeField.setTime(fieldsCache[8]);
  };

  const win = new QMainWindow();
  win.setWindowTitle("Reservation System");
  // win.resize(800, 600);

  let reserveButtonSignal: string;

  // Pre-Defined Fonts
  const listItemsFont = new QFont("B Mitra", 14)

  const buttonSmallFont = new QFont("B Mitra", 12)
  buttonSmallFont.setBold(true);

  const buttonLargeFont = new QFont("B Mitra", 16)
  buttonLargeFont.setBold(true);

  const mainTitleFont = new QFont("B Titr", 20);

  const titleFont = new QFont("B Nazanin", 18);
  titleFont.setBold(true);

  const labelFont = new QFont("B Nazanin", 13);
  labelFont.setBold(true);

  const fieldFont = new QFont("B Mitra", 15);

  const numberFont = new QFont("Arial", 11.5);

  // List of Customers, `Add` and `Remove` Buttons
  const customerList = new QListWidget();
  customerList.setFont(listItemsFont);

  // Append the [Add New Customer] Item to List
  const addCustomer = new QListWidgetItem("افزودن بیمار جدید");
  addCustomer.setFont(new QFont("B Titr", 15))
  addCustomer.setBackground(new QBrush(new QColor("#ccffffff")));
  addCustomer.setTextAlignment(AlignmentFlag.AlignCenter);
  customerList.addItem(addCustomer);

  customerList.addEventListener("currentItemChanged", () => {
    // Fill Fields Based on Selected Customer on List
      currentTimeSignature = undefined;
      if(customerList.currentIndex().row() === 0){
        if(!(fieldsCache.length === 0)){
          fillFromCache(fieldsCache);
        }
        else{
          clearFields();
        }

        enableFields(firstNameField, lastNameField, 
          genderField, ageField, callNumberField, 
          identityCodeField, dayField, monthField, 
          yearField, timeField)
        reserveButton.setDisabled(false);
        clearButton.setDisabled(false);
        editButton.setDisabled(true);
        reserveButtonSignal = "add";
      }
      else{
        fillFields(databasePath, customerList.currentItem(), firstNameField, lastNameField, 
        genderField, ageField, callNumberField, 
        identityCodeField, dayField, monthField, 
        yearField, timeField)
        disableFields();
        reserveButton.setDisabled(true);
        clearButton.setDisabled(true);
        editButton.setDisabled(false);
        }
      })

  const listLayout = new QBoxLayout(Direction.TopToBottom);
  listLayout.addWidget(customerList, 8);
  
  const editButton = new QPushButton();
  editButton.setText("ویرایش");
  editButton.setFont(buttonSmallFont);
  editButton.addEventListener("clicked", () => {
    enableFields(firstNameField, lastNameField, 
            genderField, ageField, callNumberField, 
            identityCodeField, dayField, monthField, 
            yearField, timeField);
    reserveButtonSignal = "update";
    editButton.setDisabled(true);
    reserveButton.setDisabled(false);
    // Capture the current Reserved Time Signature for exclusion in validation
    const day = dayField.value();
    const month = monthField.currentIndex();
    const year = yearField.value();
    const minute = timeField.time().minute();
    const hour = timeField.time().hour();
    currentTimeSignature = day.toString() + month.toString() + year.toString() +
      minute.toString() + hour.toString();
  })

  listLayout.addWidget(editButton, 1);

  const removeButton = new QPushButton();
  removeButton.setText("حذف");
  removeButton.setFont(buttonSmallFont);
  removeButton.addEventListener("clicked", () => {
    removeFromJSON(databasePath, customerList.currentItem(), logsLabel)
    customerList.takeItem(customerList.currentRow());
  });

  listLayout.addWidget(removeButton, 1)
  
  const listWidget = new QWidget();
  listWidget.setLayout(listLayout);

  // Content Layout
  const contentLayout = new QBoxLayout(Direction.TopToBottom);
  const contentWidget = new QWidget();
  contentWidget.setLayout(contentLayout);

  // ... Title Layout
  const titleLayout = new QBoxLayout(Direction.TopToBottom);
  const titleWidget = new QWidget();
  titleWidget.setLayout(titleLayout);

  // ... ... Title of Program
  const mainTitle = new QLabel();
  mainTitle.setText("سامانه رزرو نوبت");
  mainTitle.setFont(mainTitleFont);
  mainTitle.setAlignment(AlignmentFlag.AlignCenter);
  mainTitle.setObjectName("title-label")
  mainTitle.setStyleSheet(`
    #title-label {
      border: 2px solid black;
    }`)

  titleLayout.addWidget(mainTitle);
  contentLayout.addWidget(titleWidget);

  // ... Customer Information Layout
  const infoLayout = new QBoxLayout(Direction.TopToBottom);
  const infoWidget = new QWidget();
  infoWidget.setLayout(infoLayout);
  contentLayout.addWidget(infoWidget);

  // ... ... Title of Customer Information Layout
  const infoTitle = new QLabel();
  infoTitle.setText("اطلاعات بیمار");
  infoTitle.setFont(titleFont);
  infoTitle.setAlignment(AlignmentFlag.AlignCenter)
  infoTitle.frameRect();

  const infoTitleLayout = new QBoxLayout(Direction.TopToBottom);
  infoTitleLayout.addWidget(infoTitle);
  const infoTitleWidget = new QWidget(); 
  infoTitleWidget.setLayout(infoTitleLayout);
  infoLayout.addWidget(infoTitleWidget);

  // ... ... Customer Information Fields and Labels Layout
  const infoFieldsLayout = new QGridLayout();
  const infoFieldsWidget = new QWidget();
  infoFieldsWidget.setLayout(infoFieldsLayout);
  infoLayout.addWidget(infoFieldsWidget);
  infoFieldsLayout.setHorizontalSpacing(30);

  // ... ... ... Customer Information Labels
  const firstNameLabel = new QLabel();
  firstNameLabel.setText("نام")
  firstNameLabel.setFont(labelFont)
  firstNameLabel.setAlignment(AlignmentFlag.AlignCenter);
  infoFieldsLayout.addWidget(firstNameLabel,0, 3);
  
  const lastNameLabel = new QLabel();
  lastNameLabel.setText("نام خانوادگی")
  lastNameLabel.setFont(labelFont)
  lastNameLabel.setAlignment(AlignmentFlag.AlignCenter);
  infoFieldsLayout.addWidget(lastNameLabel, 0, 2);

  const genderLabel = new QLabel();
  genderLabel.setText("جنسیت")
  genderLabel.setFont(labelFont)
  genderLabel.setAlignment(AlignmentFlag.AlignCenter)
  infoFieldsLayout.addWidget(genderLabel, 0, 1);

  const ageLabel = new QLabel();
  ageLabel.setText("سن")
  ageLabel.setFont(labelFont)
  ageLabel.setAlignment(AlignmentFlag.AlignCenter)
  infoFieldsLayout.addWidget(ageLabel, 0, 0);

  const callNumberLabel = new QLabel();
  callNumberLabel.setText("شماره موبایل")
  callNumberLabel.setFont(labelFont)
  callNumberLabel.setAlignment(AlignmentFlag.AlignCenter)
  infoFieldsLayout.addWidget(callNumberLabel, 3, 2);

  const identityCodeLabel = new QLabel();
  identityCodeLabel.setText("کد ملی");
  identityCodeLabel.setFont(labelFont)
  identityCodeLabel.setAlignment(AlignmentFlag.AlignCenter)
  infoFieldsLayout.addWidget(identityCodeLabel, 3, 1);
  
  infoFieldsLayout.setRowMinimumHeight(2 ,15);

  // ... ... ... Customer Information Fields
  const firstNameField = new QLineEdit();
  firstNameField.setFont(fieldFont);
  firstNameField.setAlignment(AlignmentFlag.AlignCenter);
  firstNameField.setMinimumWidth(80);
  infoFieldsLayout.addWidget(firstNameField, 1, 3);
  filterPersian(firstNameField);

  const lastNameField = new QLineEdit();
  lastNameField.setFont(fieldFont);
  lastNameField.setAlignment(AlignmentFlag.AlignCenter);
  lastNameField.setMinimumWidth(80);
  infoFieldsLayout.addWidget(lastNameField, 1, 2);
  filterPersian(lastNameField);
  
  const genderField = new QComboBox();
  genderField.addItems(["مرد", "زن"]);
  genderField.setFont(fieldFont);
  infoFieldsLayout.addWidget(genderField, 1, 1);

  const ageField = new QLineEdit();
  ageField.setFont(new QFont("Arial", 13.5));
  ageField.setAlignment(AlignmentFlag.AlignCenter);
  ageField.setMaximumWidth(45);
  ageField.setMaxLength(3);
  filterAge(ageField);
  infoFieldsLayout.addWidget(ageField, 1, 0);

  const callNumberField = new QLineEdit();
  callNumberField.setFont(labelFont);
  callNumberField.setAlignment(AlignmentFlag.AlignCenter);
  callNumberField.setMinimumWidth(60);
  callNumberField.setMaxLength(11);
  callNumberField.setPlaceholderText("شماره باید با 09 شروع شود");
  filterCallNumber(callNumberField);

  infoFieldsLayout.addWidget(callNumberField, 4, 2);

  const identityCodeField = new QLineEdit();
  identityCodeField.setFont(numberFont);
  identityCodeField.setAlignment(AlignmentFlag.AlignCenter);
  identityCodeField.setMinimumWidth(60);
  identityCodeField.setMaxLength(10);
  identityCodeField.setMinimumHeight(35);
  infoFieldsLayout.addWidget(identityCodeField, 4, 1);
  filterNumber(identityCodeField);

  // ... Reservation and Logs Layout
  const reserveAndLogsLayout = new QBoxLayout(Direction.RightToLeft);
  const reserveAndLogsWidget = new QWidget();
  reserveAndLogsWidget.setLayout(reserveAndLogsLayout);
  contentLayout.addWidget(reserveAndLogsWidget);

  // ... ... Reservation Layout
  const reserveLayout = new QBoxLayout(Direction.TopToBottom);
  const reserveWidget = new QWidget();
  reserveWidget.setLayout(reserveLayout);
  reserveAndLogsLayout.addWidget(reserveWidget);


  // ... ... ... Reservation Title
  const reserveTitle = new QLabel();
  reserveTitle.setText("تاریخ و زمان نوبت بعدی");
  reserveTitle.setFont(titleFont);
  reserveTitle.setAlignment(AlignmentFlag.AlignCenter)
  reserveLayout.addWidget(reserveTitle);

  // ... ... ... Reservation Fields and Labels Layout
  const reserveFieldsLayout = new QGridLayout();
  const reserveFieldsWidget = new QWidget();
  reserveFieldsWidget.setLayout(reserveFieldsLayout);
  reserveLayout.addWidget(reserveFieldsWidget);

  // ... ... ... ... ... Reservation Labels
  const dayLabel = new QLabel();
  dayLabel.setText("روز")
  dayLabel.setFont(labelFont)
  dayLabel.setAlignment(AlignmentFlag.AlignCenter);
  reserveFieldsLayout.addWidget(dayLabel, 0, 3);

  const monthLabel = new QLabel();
  monthLabel.setText("ماه")
  monthLabel.setFont(labelFont)
  monthLabel.setAlignment(AlignmentFlag.AlignCenter);
  reserveFieldsLayout.addWidget(monthLabel, 0, 2);

  const yearLabel = new QLabel();
  yearLabel.setText("سال")
  yearLabel.setFont(labelFont)
  yearLabel.setAlignment(AlignmentFlag.AlignCenter);
  reserveFieldsLayout.addWidget(yearLabel, 0, 1);

  const timeLabel = new QLabel();
  timeLabel.setText("ساعت")
  timeLabel.setFont(labelFont)
  timeLabel.setAlignment(AlignmentFlag.AlignCenter);
  reserveFieldsLayout.addWidget(timeLabel, 0, 0);

  // ... ... ... ... ... Reservation Fields
  const timeField = new QTimeEdit();
  timeField.setMinimumHeight(35);
  timeField.setMaximumWidth(70);
  timeField.setDisplayFormat("hh:mm");
  timeField.setFont(new QFont("Arial", 12));
  reserveFieldsLayout.addWidget(timeField, 1, 0);

  const yearField = new QSpinBox();
  yearField.setMinimumHeight(35);
  yearField.setMaximumWidth(60);
  yearField.setMinimum(1390);
  yearField.setMaximum(1404);
  yearField.setValue(1404);
  yearField.addEventListener("valueChanged", () => {
    dayField.setMaximum(correspondDays(monthField.currentText(), yearField.value()));
  });
  reserveFieldsLayout.addWidget(yearField, 1, 1);
  
  const monthField = new QComboBox();
  monthField.setMinimumHeight(35);
  monthField.setMaximumWidth(90);
  monthField.addItems(months);
  monthField.setFont(labelFont);
  monthField.addEventListener("currentTextChanged", () => {
    dayField.setMaximum(correspondDays(monthField.currentText(), yearField.value()));
  });
  reserveFieldsLayout.addWidget(monthField ,1, 2);

  const dayField = new QSpinBox();
  dayField.setMinimumHeight(35);
  dayField.setMaximumWidth(60);
  dayField.setMinimum(1);
  dayField.setMaximum(31);
  reserveFieldsLayout.addWidget(dayField ,1, 3);


  // ... ... ... Reservation Button
  const reserveButton = new QPushButton();
  reserveButton.setText("ثبت");
  reserveButton.setFont(buttonLargeFont);
  let id = 0;
  reserveButton.addEventListener("clicked", () => {
    logsLabel.setText("");
    if(validateFirstName(firstNameField, logsLabel)
    && validateLastName(lastNameField, logsLabel)
    && validateCallNumber(callNumberField, logsLabel)
    && validateIdCode(identityCodeField, logsLabel)
    && validateAge(ageField, logsLabel)
    && (validateInterference(databasePath, dayField, monthField, yearField, timeField, logsLabel)))
    {
      // This pieces of code, Adds the new customer to the list at current program session
      if(reserveButtonSignal === "add"
        && validateInterference(databasePath, dayField, monthField, yearField, timeField, logsLabel)
      ){
        exportCustomer();
        removeAllExceptFirst(customerList);
        updateList(databasePath, customerList, logsLabel, addCustomer);
        disableFields();
      }
      else if(reserveButtonSignal === "update"){
          id = getIdByItem(customerList.currentItem());
          removeFromJSON(databasePath, customerList.currentItem(), logsLabel);
          exportCustomer(id);
          removeAllExceptFirst(customerList);

          updateList(databasePath, customerList, logsLabel, addCustomer);
          disableFields();
      };

    };
  });
  reserveLayout.addWidget(reserveButton);

  // ... ... Logs Layout
  const logsLayout = new QBoxLayout(Direction.TopToBottom);
  const logsWidget = new QWidget();
  logsWidget.setLayout(logsLayout);
  reserveAndLogsLayout.addWidget(logsWidget);

  //... ... ... Logs Title
  const logsTitle = new QLabel();
  logsTitle.setText("اعلان ها");
  logsTitle.setFont(titleFont);
  logsTitle.setAlignment(AlignmentFlag.AlignCenter)
  logsLayout.addWidget(logsTitle);

  //... ... ... Logs Label
  const logsLabel = new QLabel();
  logsLabel.setObjectName("logs-label");
  logsLabel.setStyleSheet(`
    #logs-label {
      font-family: "B Nazanin";
      font-size: 16px;
      border: 1px solid gray;
    }`)
  logsLayout.addWidget(logsLabel);
  

  // Save Cache When any of the fields changed
    firstNameField.addEventListener("textEdited", () => {
      if(customerList.currentIndex().row() === 0){
        if(customerList.currentIndex().row() === 0){
        saveCache();
        }
      }
    })
    lastNameField.addEventListener("textEdited", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    genderField.addEventListener("currentIndexChanged", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    ageField.addEventListener("textEdited", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    callNumberField.addEventListener("textEdited", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    identityCodeField.addEventListener("textEdited", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    dayField.addEventListener("valueChanged", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    monthField.addEventListener("currentIndexChanged", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    yearField.addEventListener("valueChanged", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })
    timeField.addEventListener("dateChanged", () => {
      if(customerList.currentIndex().row() === 0){
        saveCache();
      }
    })

  //... ... ... Clear Button
  const clearButton = new QPushButton();
  clearButton.setText("پاک کردن فیلدها");
  clearButton.setFont(buttonLargeFont);
  logsLayout.addWidget(clearButton);
  clearButton.addEventListener("clicked", () => {
    clearFields();
    fieldsCache = [];
  })

    // firstName: firstNameField, lastName: lastNameField,
    // gender: genderField, age: ageField, callNumber: callNumberField, idCode: identityCodeField,
    // day: dayField, month: monthField, year: yearField, time: timeField

  const layout = new QBoxLayout(Direction.RightToLeft);
  layout.addWidget(listWidget);
  layout.addWidget(contentWidget);
  // layout.addWidget(dateWidget);
  
  const centralWidget = new QWidget();
  centralWidget.setLayout(layout);
  win.setCentralWidget(centralWidget);

  updateList(databasePath, customerList, logsLabel, addCustomer);
  win.show();

    (global as any).win = win;
  }

main();