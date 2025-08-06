const months = [
    "فروردین", "اردیبهشت", "خرداد",
    "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر",
    "دی", "بهمن", "اسفند"
];

function isLeapYear(year: number) :boolean {
    if(year >= 1343 && year <= 1472){
        return [1, 5, 9, 13, 17, 22, 26, 30].includes(year%33);
    }
    else{
        return [1, 5, 9, 13, 17, 21, 26, 30].includes(year%33);
    }
};

function correspondDays(month: string, year: number): number{
    const monthNumber: number = months.indexOf(month) + 1;
    if(monthNumber <= 6){
        return 31;
    }
    else if(monthNumber > 6 && monthNumber < 12){
        return 30;
    }
    else if(monthNumber === 12 && !isLeapYear(year)){
        return 29;
    }
    else{
        return 30;
    };

};

export {
    months,
    correspondDays
};

