import { QComboBox, QLineEdit, QSpinBox, QTimeEdit, QLabel, QListWidget, QListWidgetItem, AlignmentFlag, QFont, QTime, QWheelEvent, QWidget } from "@nodegui/nodegui";
import fs from 'fs'
import jsonfile from 'jsonfile'

function dataToObject(firstName: QLineEdit, lastName: QLineEdit,
    gender: QComboBox, age: QLineEdit, callNumber: QLineEdit, idCode: QLineEdit,
    day: QSpinBox, month: QComboBox, year: QSpinBox, time: QTimeEdit, id: number
): object {
    const result = {
        "First Name": firstName.text(),
        "Last Name": lastName.text(),
        "Gender": gender.currentIndex(),
        "Age": age.text(),
        "Call Number": callNumber.text(),
        "ID Code": idCode.text(),
        "Reserved Day": day.value(),
        "Reserved Month": month.currentIndex(),
        "Reserved Year": year.value(),
        "Reserved Time Minute": time.time().minute() ,
        "Reserved Time Hour": time.time().hour() ,
        "id": id,
    };
    if(id !== undefined){
        result["id"] = id
    };
    
    return result;
};

function exportToJSON(filePath: string, newObject: object, logsLabel: QLabel) {
    try {
        let jsonData: object[];

        if (!fs.existsSync(filePath)) {
            // File doesn't exist, create it with initial data
            jsonData = [newObject];
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            logsLabel.clear()
            logsLabel.setText(logsLabel.text() + "\n" + "دیتابیس جدید با موفقیت ایجاد شد و تغییرات اعمال شدند");
            return;
        }

        const data = fs.readFileSync(filePath, 'utf8');
        jsonData = JSON.parse(data);

        // Assuming the JSON file contains an array
        jsonData.push(newObject);

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
        logsLabel.clear();
        logsLabel.setText(logsLabel.text() + "\n" + 'تغییرات با موفقیت اعمال شدند');
    } catch (err: any) {
        if (err instanceof SyntaxError) {
            console.error('Error parsing JSON:', err);
        } else {
            console.error('File operation error:', err);
        }
    }
};

function removeFromJSON(filePath: string, listWidgetItem: QListWidgetItem, logsLabel: QLabel): void {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData: object[] = JSON.parse(data);

        const id = Number(listWidgetItem.text().match(/^\d+/)); // Adjusted regex to match optional 'x'

        const index = jsonData.findIndex(patient => patient["id"] === id);
        if (index !== -1) {
            jsonData.splice(index, 1);

            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
            logsLabel.clear();
            logsLabel.setText(logsLabel.text() + "\n" + 'تغییرات با موفقیت اعمال شدند');
        } else {
            logsLabel.setText(logsLabel.text() + "\n" + 'بیمار مورد نظر یافت نشد');
        }
    } catch (err) {
        console.error('Error processing file:', err);
        logsLabel.clear();
        logsLabel.setText(logsLabel.text() + "\n" + 'خطا در پردازش فایل دیتابیس');
    }
};

function updateList(filePath: string, listWidget: QListWidget, logsLabel: QLabel, 
    arbitraryItem?: QListWidgetItem): void {
    try {
        if(arbitraryItem !== undefined){
            listWidget.addItem(arbitraryItem);
        }
        const data = jsonfile.readFileSync(filePath);
        for (const patient of data) {
            const newItem = new QListWidgetItem();
            newItem.setText(`${patient["id"]}: ${patient["Last Name"]}`);
            newItem.setFont(new QFont("B Mitra", 14));
            newItem.setTextAlignment(AlignmentFlag.AlignCenter);
            listWidget.addItem(newItem);
        }
    } catch (err) {
        logsLabel.clear();
        logsLabel.setText("مشکلی در فایل دیتابیس پیش آمده است");
        console.error("Error reading database:", err);
    }
}

function fillFields(
    filePath: string,
    listWidgetItem: QListWidgetItem,
    firstNameField: QLineEdit,
    lastNameField: QLineEdit,
    genderField: QComboBox,
    ageField: QLineEdit,
    callNumberField: QLineEdit,
    identityCodeField: QLineEdit,
    dayField: QSpinBox,
    monthField: QComboBox,
    yearField: QSpinBox,
    timeField: QTimeEdit
): void {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData: object[] = JSON.parse(data);

        const id = Number(listWidgetItem.text().match(/^\d+/));

        for (const patient of jsonData) {
            if (patient["id"] === id) {
                firstNameField.setText(patient["First Name"]);
                lastNameField.setText(patient["Last Name"]);
                genderField.setCurrentIndex(patient["Gender"]);
                ageField.setText(patient["Age"]);
                callNumberField.setText(patient["Call Number"]);
                identityCodeField.setText(patient["ID Code"]);
                dayField.setValue(patient["Reserved Day"]);
                monthField.setCurrentIndex(patient["Reserved Month"]);
                yearField.setValue(patient["Reserved Year"]);

                const time = new QTime();
                time.setHMS(patient["Reserved Time Hour"], patient["Reserved Time Minute"], 0);
                timeField.setTime(time);

                break; // Stop once the matching patient is found
            }
        }
    } catch (err) {
        console.error('Error reading or parsing file:', err);
    }
}

function getIdByItem(listWidgetItem:QListWidgetItem): number{
    const id = Number(listWidgetItem.text().match(/^\d+/));
    return id;
};

export{
    dataToObject,
    exportToJSON,
    removeFromJSON,
    updateList,
    fillFields,
    getIdByItem,
};