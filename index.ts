import fetch from 'cross-fetch';

import { DOMParser } from '@xmldom/xmldom';

class Dymo {
  constructor() { }

  static get url() {
    return 'https://127.0.0.1:41951/DYMO/DLS/Printing';
  }

  static async getPrinters() {
    try {
      const response = await fetch(`${this.url}/GetPrinters`);
      const data = await response.text();

      const parser = new DOMParser();
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
    } catch (e) {
      return { success: false, data: e };
    }
  }

  static async renderLabel(xml: string) {
    try {
      const body = `labelXml=${xml}`;
      const response = await fetch(`${this.url}/RenderLabel`, {
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const data = await response.text();
      const result = 'data:image/png;base64,' + data.slice(1, -1);
      return { success: true, data: result };
    } catch (e) {
      return { success: false, data: e };
    }
  }

  static async printLabel(printer: string, xml: string, parameters: LabelParameters) {
    try {
      const params = this.createLabelParameters(parameters);
      const body = `printerName=${printer}&labelXml=${xml}&printParamsXml=${params}`;
      const response = await fetch(`${this.url}/PrintLabel`, {
        body,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result = await response.text();
      if (result !== 'true') return { success: false, data: result };

      return { success: true };
    } catch (e) {
      return { success: false, data: e };
    }
  }

  static async createLabelParameters(parameters: LabelParameters) {
    const xml: XMLDocument = (new DOMParser()).parseFromString('<LabelWriterPrintParams/>');
    const root: Element = xml.documentElement;

    const appendElement = (parentElement: Element, tagName: string, value: string) => {
      const element = parentElement.ownerDocument.createElement(tagName);
      element.appendChild(parentElement.ownerDocument.createTextNode(value));
      parentElement.appendChild(element);
    };

    const serialize = (document: Document) => {
      const serializer = new XMLSerializer();
      return serializer.serializeToString(document);
    };

    if (parameters.copies && parameters.copies > 1)
      appendElement(root, "Copies", parameters.copies.toString());

    if (parameters?.jobTitle)
      appendElement(root, "JobTitle", parameters.jobTitle);

    if (parameters?.flowDirection)
      appendElement(root, "FlowDirection", parameters.flowDirection);

    if (parameters?.printQuality)
      appendElement(root, "PrintQuality", parameters.printQuality);

    if (parameters?.twinTurboRoll)
      appendElement(root, "TwinTurboRoll", parameters.twinTurboRoll);

    return serialize(xml);
  }

}

type LabelParameters = {
  copies: number | null;
  jobTitle: string | null;
  flowDirection: 'LeftToRight' | 'RightToLeft' | null;
  printQuality: 'Text' | 'BarcodeAndGraphics' | 'Auto' | null;
  twinTurboRoll: 'Left' | 'Right' | 'Auto' | null;
};

export default Dymo;
export { };
