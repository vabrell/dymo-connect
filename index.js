"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const xmldom_1 = require("@xmldom/xmldom");
class Dymo {
    constructor() { }
    static get url() {
        return 'https://127.0.0.1:41951/DYMO/DLS/Printing';
    }
    static getPrinters() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, cross_fetch_1.default)(`${this.url}/GetPrinters`);
                const data = yield response.text();
                const parser = new xmldom_1.DOMParser();
                const xml = parser.parseFromString(data, 'text/xml');
                const names = xml.getElementsByTagName('Name');
                const models = xml.getElementsByTagName('ModelName');
                const connections = xml.getElementsByTagName('IsConnected');
                let result = [];
                for (let i = 0; i < names.length; i++) {
                    result.push({
                        name: names[i].childNodes[0].nodeValue,
                        model: models[i].childNodes[0].nodeValue,
                        connected: connections[i].childNodes[0].nodeValue === 'True' ? true : false,
                    });
                }
                return { success: true, data: result };
            }
            catch (e) {
                return { success: false, data: e };
            }
        });
    }
    static renderLabel(xml) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = `labelXml=${xml}`;
                const response = yield (0, cross_fetch_1.default)(`${this.url}/RenderLabel`, {
                    body,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const data = yield response.text();
                const result = 'data:image/png;base64,' + data.slice(1, -1);
                return { success: true, data: result };
            }
            catch (e) {
                return { success: false, data: e };
            }
        });
    }
    static printLabel(printer, xml, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = this.createLabelParameters(parameters);
                const body = `printerName=${printer}&labelXml=${encodeURIComponent(xml)}&printParamsXml=${encodeURIComponent(params)}`;
                const response = yield (0, cross_fetch_1.default)(`${this.url}/PrintLabel`, {
                    body,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const result = yield response.text();
                if (result !== 'true')
                    return { success: false, data: result };
                return { success: true };
            }
            catch (e) {
                return { success: false, data: e };
            }
        });
    }
    static createLabelParameters(parameters) {
        let xmlParameters = '<LabelWriterPrintParams>';
        if (parameters.copies && parameters.copies > 1)
            xmlParameters += `<Copies>${parameters.copies}</Copies>`;
        if (parameters === null || parameters === void 0 ? void 0 : parameters.jobTitle)
            xmlParameters += `<JobTitle>${parameters.jobTitle}</JobTitle>`;
        if (parameters === null || parameters === void 0 ? void 0 : parameters.flowDirection)
            xmlParameters += `<FlowDirection>${parameters.jobTitle}</FlowDirection>`;
        if (parameters === null || parameters === void 0 ? void 0 : parameters.printQuality)
            xmlParameters += `<PrintQuality>${parameters.printQuality}</PrintQuality>`;
        if (parameters === null || parameters === void 0 ? void 0 : parameters.twinTurboRoll)
            xmlParameters += `<TwinTurboRoll>${parameters.twinTurboRoll}</TwinTurboRoll>`;
        xmlParameters += '</LabelWriterPrintParams>';
        return xmlParameters;
    }
}
exports.default = Dymo;
