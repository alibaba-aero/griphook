import { banks } from './banks.json';

let cache = {};

/**
 * Will Find Bank Info Based On Value Of A Key
 * @method  findBankByValue
 * @param   {String}    value
 * @param   {String}    Key
 * @returns {Object}
 */
const findBankByValue = (value, key) => {
    // Check If value Was Cached
    if (cache[key]) {
        return cache[key];
    } else {
        const bank = banks.find(bank => bank[key] === value);
        if (!bank) return {};
        cache[key] = { ...bank };
        return bank;
    };
};

/**
 * Will Find Bank Info Based On English Name
 * @method  findBankByName
 * @param   {String}    bankName
 * @returns {Object}
 */
const findBankByName = (bankName) => {
    return findBankByValue(bankName, 'name');
}

/**
 * Will Find Bank Info Based On Farsi Name
 * @method  findBankByName
 * @param   {String}    bankName
 * @returns {Object}
 */
const findBankByFarsiName = (bankName) => {
    return findBankByValue(bankName, 'name_farsi');
}

/**
 * Will Check Whether Given String Is A Valid PAN Or Not
 * See This Link For More Info: https://www.geeksforgeeks.org/luhn-algorithm/
 * @method  validatePAN
 * @param   {String|Number}    cardNumber
 * @returns {Boolean}
 */
const validatePAN = (cardNumber) => {
    // Check Characters
    if (!/^\d{16}$/.test(cardNumber)) return false;

    // Check Luhn Algorithm
    const digitsSum = Array.from('0' + String(cardNumber)).map(x => parseInt(x)).reduce((acc, cur, idx) => {
        const mul = idx % 2 === 1 ? 2 : 1; // Double The Current Digit If Was On Odd Index
        return acc + (cur * mul) - (cur * mul > 9 ? 9 : 0); // Make Sure Not To Exceed 9 When Doubling
    }) || 0;
    return digitsSum % 10 === 0;
};

/**
 * Will Censor Parts Of A Credit Card And Put A Dash Between Every Four Digits
 * @method  visualizePAN
 * @param   {String|Number}    cardNumber
 * @param   {Object}           _options
 * @returns {String}
 */
const visualizePAN = (cardNumber, _options) => {
    cardNumber = String(cardNumber); // Make Sure Working With Is String

    // Check Characters
    if (!/^[\d*]+$/.test(cardNumber)) return cardNumber;

    const options = {
        spacerChar: '-',
        censor: false,
        censorChar: '*',
        censorLength: 4,
        ..._options,
    };

    let pan = cardNumber;

    // Censor Center Part Of PAN
    if (options.censor && cardNumber.length > options.censorLength && cardNumber.length === 16) {
        const panSegment = (cardNumber.length - options.censorLength) / 2;
        pan = cardNumber.slice(0, Math.ceil(panSegment)) +
            options.censorChar.repeat(options.censorLength) +
            cardNumber.slice(Math.floor(panSegment) * -1);
    }

    return pan.match(/.{1,4}/g).join(options.spacerChar);
};

/**
 * Will Find Bank Info With PAN IIN+
 * See This Link For More Info: https://en.wikipedia.org/wiki/Payment_card_number
 * @method  findBankByPAN
 * @param   {String|Number}    cardNumber
 * @returns {Object}
 */
const findBankByPAN = (cardNumber) => {
    cardNumber = String(cardNumber); // Make Sure Working With Is String

    // Check Characters
    if (!/^[\d*]+$/.test(cardNumber) && cardNumber.length < 6) return cardNumber;

    const iin = cardNumber.slice(0, 6); // Extract Issuer Identification Number

    // Check If IIN Was Cached
    if (cache[iin]) {
        return cache[iin];
    } else {
        const bank = banks.find(bank => bank.pan_iin.includes(iin));
        if (!bank) return {};
        cache[iin] = { ...bank };
        return bank;
    };
};

/**
 * Will Check Whether Given String Is A Valid IBAN Or Not
 * See This Link For More Info: https://en.wikipedia.org/wiki/International_Bank_Account_Number
 * @method  validatePAN
 * @param   {String|Number}    cardNumber
 * @returns {Boolean}
 */
const validateIBAN = (accountNumber) => {
    // Check Chartacters
    if (!/^IR\d{24}$/.test(accountNumber)) return false;

    const code = accountNumber.match(/^([A-Z]{2})(\d{2})([A-Z\d]+)$/); // Match And Capture (0) The Country Code, (1) The Check Digits, And (3) The Rest
    // Check Syntax And Length
    if (!code) return false;

    function mod97(string) {
        let checksum = string.slice(0, 2);
        let fragment;
        for (let offset = 2; offset < string.length; offset += 7) {
            fragment = String(checksum) + string.substring(offset, offset + 7);
            checksum = parseInt(fragment, 10) % 97;
        }
        return checksum;
    }

    // // Rearrange country Code & Check Digits, Convert Chars To Ints
    let digits = (code[3] + code[1] + code[2]).replace(/[A-Z]/g, letter => {
        return letter.charCodeAt(0) - 55;
    });
    // // Final Check
    return mod97(digits) === 1;
};

/**
 * Will Put A Dash Between Every Four Digits
 * @method  visualizeIBAN
 * @param   {String|Number}    cardNumber
 * @param   {Object}           _options
 * @returns {String}
 */
const visualizeIBAN = (accountNumber, _options) => {
    accountNumber = String(accountNumber); // Make Sure Working With Is String

    // Check Characters
    if (!/^IR[\d*]+$/.test(accountNumber)) return accountNumber;

    const options = {
        spacerChar: '-',
        ..._options,
    };

    let iban = accountNumber;

    return iban.match(/.{1,4}/g).join(options.spacerChar);
};

/**
 * Will Find Bank Info With IBAN NationalBankCode
 * See This Link For More Info: https://en.wikipedia.org/wiki/International_Bank_Account_Number
 * @method  findBankByIBAN
 * @param   {String|Number}    accountNumber
 * @returns {Object}
 */
const findBankByIBAN = (accountNumber) => {
    accountNumber = String(accountNumber); // Make Sure Working With Is String

    // Check Characters
    if (!/^IR[\d*]+$/.test(accountNumber) && accountNumber.length < 7) return accountNumber;

    const NationalBankCode = accountNumber.slice(4, 7); // Extract Issuer Identification Number
    // Check If NationalBankCode Was Cached
    if (cache[NationalBankCode]) {
        return cache[NationalBankCode];
    } else {
        const bank = banks.find(bank => bank.iban_nbc === NationalBankCode);
        if (!bank) return {};
        cache[NationalBankCode] = { ...bank };
        return bank;
    };
};

export {
    banks,
    findBankByName,
    findBankByFarsiName,
    validatePAN,
    visualizePAN,
    findBankByPAN,
    validateIBAN,
    visualizeIBAN,
    findBankByIBAN,
};
