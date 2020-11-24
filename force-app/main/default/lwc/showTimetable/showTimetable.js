import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_HORARIO_GOOGLE from '@salesforce/schema/Account.HorarioGoogle__c';

const orderedDays = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export default class ShowTimetable extends LightningElement {
      @api recordId;
      error;
      timetable;


      @wire(getRecord, { recordId: '$recordId', fields: [ACCOUNT_HORARIO_GOOGLE]})
      wiredGoogleData({ error, data }) {
        if (data) {
            this.timetable = [];
            let objData = JSON.parse(data.fields.HorarioGoogle__c.value);
            for (let key of orderedDays) {
                  let dayOfWeek = {};
                  let strTimetable;
                  dayOfWeek.day = this.capitalizeFirstLetter(key);
                  if (objData[key]) {
                        objData[key].forEach( slot => {
                              strTimetable = strTimetable ? strTimetable + ", " +  this.hourFormat(slot) : this.hourFormat(slot);
                        });
                  } else {
                        strTimetable = "Cerrado";
                  }
                  dayOfWeek.timetable = strTimetable;
                  // no usar push() - hay que crear copia del array para que se actualice la propiedad
                  // spread operator o concat
                  this.timetable = [...this.timetable, dayOfWeek];
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

      // ---- helper methods
      formatNum(num) {
            return num==0 ? "00" : num;
    }
    
     hourFormat(arr) {
            if (arr.length == 4) {
            return this.formatNum(arr[0])+":"+this.formatNum(arr[1])+" - "+ this.formatNum(arr[2])+":"+this.formatNum(arr[3]);
            } else {
            return "Cerrado";
            }
      }

      capitalizeFirstLetter(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
      }
}