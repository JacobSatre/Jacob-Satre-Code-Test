/* DEVLOPMENT CODE TEST JACOB SATRE */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* variables - elements */
var inputElement = document.getElementById("input-element");
var outputElement = document.getElementById("output-element");
var errorElement = document.getElementById("error-element");
/* variables */
var userInput = "";
var userInputSplit = userInput.split(/\r?\n/);
var lineItems = [];
var lineItemCategories = [];
var errorStatus = false;
var errorMessage = "Errors:\n";
var results = "";
var resultsTax = 0;
var resultsTotal = 0;
/* regular expressions */
var regexQuantity = /^[0-9,]+\.{0,1}[0-9]*/;
var regexPrice = /\${0,1}[0-9,]+\.{0,1}[0-9]*$/;
var regexEmpty = /.*\S.*/;
var regexLetters = /[a-z]/i;
var regexDollar = /\$/;
var regexComma = /,/;
var regexAt = /at[\s\t]*$/i;
var regexImported = /^imported\s/i;
var regexTaxExempt = /book|bandage|pill|medicine|chocolate|apple|orange/i;
/* classes */
var LineItem = /** @class */ (function () {
    function LineItem(LineItem) {
        this.name = LineItem.name;
        this.quantity = LineItem.quantity;
        this.price = LineItem.price;
        this.imported = LineItem.imported;
    }
    return LineItem;
}());
var LineItemCategory = /** @class */ (function (_super) {
    __extends(LineItemCategory, _super);
    function LineItemCategory() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LineItemCategory.prototype.getTax = function () {
        var tax = 0;
        if (regexTaxExempt.test(this.name) === false) {
            tax += this.price * 0.10;
        }
        if (this.imported === true) {
            tax += this.price * 0.05;
        }
        tax = round5Cents(tax);
        return tax;
    };
    return LineItemCategory;
}(LineItem));
/* utility functions */
function round5Cents(price) {
    return Number((Math.ceil(price * 20) / 20));
}
function findName(name) {
    try {
        return name.replace(regexQuantity, '').replace(regexPrice, '').replace(regexAt, '').trim();
    }
    catch (error) {
        return null;
    }
}
function findPrice(price) {
    try {
        return Number(price.trim().match(regexPrice)[0].replace(regexComma, '').replace(regexDollar, ''));
    }
    catch (error) {
        return null;
    }
}
function findQuantity(quantity) {
    try {
        return Number(quantity.trim().match(regexQuantity)[0].replace(regexComma, ''));
    }
    catch (error) {
        return null;
    }
}
function resetData() {
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
function storeLineItems(rawStrings) {
    for (var i = 0; i < rawStrings.length; i++) {
        var rawString = rawStrings[i].trim();
        var itemName = void 0;
        var itemPrice = void 0;
        var itemQuantity = void 0;
        var itemImported = void 0;
        if (regexEmpty.test(rawString) === false) {
            errorMessage += "Line " + (i + 1) + " is empty. Ignoring.\n";
            errorStatus = true;
            continue;
        }
        if (findQuantity(rawString) !== null) {
            itemQuantity = findQuantity(rawString);
        }
        else {
            errorMessage += "Problem with quantity on line " + (i + 1) + ".\n";
            errorStatus = true;
            continue;
        }
        if (findName(rawString) !== "" && regexLetters.test(rawString) === true) {
            itemName = findName(rawString);
        }
        else {
            errorMessage += "Problem with name on line " + (i + 1) + ".\n";
            errorStatus = true;
            continue;
        }
        if (findPrice(rawString) !== null) {
            itemPrice = findPrice(rawString);
        }
        else {
            errorMessage += "Problem with price on line " + (i + 1) + ".\n";
            errorStatus = true;
            continue;
        }
        itemImported = regexImported.test(itemName);
        lineItems.push(new LineItem({ name: itemName, quantity: itemQuantity, price: itemPrice, imported: itemImported }));
    }
}
/* consolidate items into categories */
function consolidateLineItems(items) {
    for (var i = 0; i < items.length; i++) {
        var foundMatch = false;
        for (var j = 0; j < lineItemCategories.length; j++) {
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
function printResult(categories) {
    for (var i = 0; i < categories.length; i++) {
        var categoryName = categories[i].name;
        var categoryQuantity = categories[i].quantity;
        var categoryTax = categories[i].getTax();
        var categoryTaxTotal = categoryTax * categoryQuantity;
        var categoryPrice = categories[i].price;
        var categoryPriceTotal = (categoryPrice + categoryTax) * categoryQuantity;
        /* add price and tax */
        resultsTax += categoryTaxTotal;
        resultsTotal += categoryPriceTotal;
        /* format each item data */
        results += categoryName + ": " + categoryPriceTotal.toFixed(2) + " ";
        if (categoryQuantity > 1) {
            results += "(" + categoryQuantity + " @ " + (categoryPrice + categoryTax).toFixed(2) + ")";
        }
        results += "\n";
    }
    results += "Sales Tax: " + resultsTax.toFixed(2) + "\nTotal: " + resultsTotal.toFixed(2);
    outputElement.innerText = results;
}
/* main function */
function generateRecipt() {
    resetData();
    if (regexEmpty.test(userInput) === true) {
        storeLineItems(userInputSplit);
        consolidateLineItems(lineItems);
        printResult(lineItemCategories);
    }
    else {
        errorMessage += "Input empty. Please enter an item.";
        errorStatus = true;
    }
    if (errorStatus === true) {
        errorElement.innerText = errorMessage;
    }
}
