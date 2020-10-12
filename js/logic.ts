/* DEVLOPMENT CODE TEST JACOB SATRE */

/* variables - elements */
let inputElement = (document.getElementById("input-element") as HTMLTextAreaElement);
let outputElement = (document.getElementById("output-element") as HTMLTextAreaElement);
let errorElement = (document.getElementById("error-element") as HTMLTextAreaElement);

/* variables */
let userInput:string = "";
let userInputSplit:string[] = userInput.split(/\r?\n/);
let lineItems:LineItem[] = [];
let lineItemCategories:LineItemCategory[] = [];
let errorStatus:boolean = false;
let errorMessage:string = "Errors:\n";
let results:string = "";
let resultsTax:number = 0;
let resultsTotal:number = 0;

/* regular expressions */
const regexQuantity:RegExp = /^[0-9,]+\.{0,1}[0-9]*/;
const regexPrice:RegExp = /\${0,1}[0-9,]+\.{0,1}[0-9]*$/;
const regexEmpty:RegExp = /.*\S.*/;
const regexLetters:RegExp = /[a-z]/i;
const regexDollar:RegExp = /\$/;
const regexComma:RegExp = /,/;
const regexAt:RegExp = /at[\s\t]*$/i;
const regexImported:RegExp = /^imported\s/i;
const regexTaxExempt:RegExp = /book|bandage|pill|medicine|chocolate|apple|orange/i;

/* interfaces*/
interface LineItem {
    name: string;
    quantity: number;
    price: number;
    imported: boolean;
}

/* classes */
class LineItem implements LineItem {
    name: string;
    quantity: number;
    price: number;
    imported: boolean;
    constructor(LineItem: LineItem) {
        this.name = LineItem.name;
        this.quantity = LineItem.quantity;
        this.price = LineItem.price;
        this.imported = LineItem.imported;
    }
}
class LineItemCategory extends LineItem {
    getTax():number {
        let tax = 0;
        if (regexTaxExempt.test(this.name) === false) {
            tax += this.price * 0.10;
        }
        if (this.imported === true) {
            tax += this.price * 0.05;
        }
        tax = round5Cents(tax);
        return tax;
    }
}

/* utility functions */
function round5Cents(price:number): number {
    return Number((Math.ceil(price*20)/20));
}
function findName(name:string): string {
    try {
        return name.replace(regexQuantity, '').replace(regexPrice, '').replace(regexAt, '').trim();
    } catch (error) {
        return null;
    }
}
function findPrice(price:string): number {
    try {
        return Number(price.trim().match(regexPrice)[0].replace(regexComma, '').replace(regexDollar, ''));
    } catch (error) {
        return null;
    }
}
function findQuantity(quantity:string): number {
    try {
        return Number(quantity.trim().match(regexQuantity)[0].replace(regexComma, ''));
    } catch (error) {
        return null;
    }
}
function resetData(): void {
    outputElement.innerHTML = "";
    errorElement.innerHTML = "";
    userInput = inputElement.value;
    userInputSplit = userInput.split(/\r?\n/);
    lineItems = [];
    lineItemCategories = [];
    errorStatus = false;
    errorMessage = "Errors:\n";
    results = "";
    resultsTax = 0;
    resultsTotal = 0;
}

/* primary functions */
/* sanitization input and convert each string to item object */
function storeLineItems(rawStrings:string[]): void {
    for (let i = 0; i < rawStrings.length; i++) {
        let rawString:string = rawStrings[i].trim();
        let itemName:string;
        let itemPrice:number;
        let itemQuantity:number;
        let itemImported:boolean;

        if (regexEmpty.test(rawString) === false) {
            errorMessage += `Line ${i + 1} is empty. Ignoring.\n`;
            errorStatus = true;
            continue
        }
        if (findQuantity(rawString) !== null) {
            itemQuantity = findQuantity(rawString);
        } else {
            errorMessage += `Problem with quantity on line ${i + 1}.\n`;
            errorStatus = true;
            continue;
        }
        if (findName(rawString) !== "" && regexLetters.test(rawString) === true) {
            itemName = findName(rawString);
        } else {
            errorMessage += `Problem with name on line ${i + 1}.\n`;
            errorStatus = true;
            continue;
        }
        if (findPrice(rawString) !== null) {
            itemPrice = findPrice(rawString);
        } else {
            errorMessage += `Problem with price on line ${i + 1}.\n`;
            errorStatus = true;
            continue;
        }
        itemImported = regexImported.test(itemName);
        lineItems.push(new LineItem({name: itemName, quantity: itemQuantity, price: itemPrice, imported: itemImported}));
    }
}

/* consolidate items into categories */
function consolidateLineItems(items:LineItem[]): void {
    for (let i = 0; i < items.length; i++) {
        let foundMatch:boolean = false;
        for (let j = 0; j < lineItemCategories.length; j++) {
            if (items[i].name.toLowerCase() === lineItemCategories[j].name.toLowerCase() && items[i].price === lineItemCategories[j].price) {
                lineItemCategories[j].quantity += items[i].quantity;
                foundMatch = true;
            }
        }
        if (foundMatch === false) {
            lineItemCategories.push(new LineItemCategory(items[i]));
        }
    }
}

/* print results */
function printResult(categories:LineItemCategory[]): void {
    for (let i = 0; i < categories.length; i++) {
        let categoryName:string = categories[i].name;
        let categoryQuantity:number = categories[i].quantity;
        let categoryTax:number = categories[i].getTax();
        let categoryTaxTotal:number = categoryTax * categoryQuantity;
        let categoryPrice:number = categories[i].price;
        let categoryPriceTotal:number = (categoryPrice + categoryTax) * categoryQuantity;
        
        /* add price and tax */
        resultsTax += categoryTaxTotal;
        resultsTotal += categoryPriceTotal;

        /* format each item data */
        results += `${categoryName}: ${categoryPriceTotal.toFixed(2)} `;
        if (categoryQuantity > 1) {
            results += `(${categoryQuantity} @ ${(categoryPrice + categoryTax).toFixed(2)})`;
        }
        results += `\n`;
    }
    results += `Sales Tax: ${resultsTax.toFixed(2)}\nTotal: ${resultsTotal.toFixed(2)}`
    outputElement.innerText = results;
}

/* main function */
function generateRecipt(): void {
    resetData();

    if (regexEmpty.test(userInput) === true) {
        storeLineItems(userInputSplit);
        consolidateLineItems(lineItems);
        printResult(lineItemCategories);
    } else {
        errorMessage += `Input empty. Please enter an item.`;
        errorStatus = true;
    }

    if (errorStatus === true) {
        errorElement.innerText = errorMessage;
    }
}
