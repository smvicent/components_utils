import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import { getRecord } from 'lightning/uiRecordApi';
import ACCOUNT_HORARIO_GOOGLE from '@salesforce/schema/Account.HorarioGoogle__c';
import ACCOUNT_ID from '@salesforce/schema/Account.Id';

const dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

export default class EditSingleDay extends LightningElement {

      @api recordId;
      error;
      keyIndex = 0;
      itemList = [];
      currentDay = dias[0];
      objData;

      @wire(getRecord, { recordId: '$recordId', fields: [ACCOUNT_HORARIO_GOOGLE]})
      wiredGoogleData({ error, data }) {
        if (data) {
            this.objData = JSON.parse(data.fields.HorarioGoogle__c.value);
            this.showDay(this.currentDay);
        }
        else if (error) {
              this.error = error;
        }

      }

      get lstDias() {
            let selectOptions = [];
            
            dias.forEach(dia => {
                  let option = {};
                  option.label = dia;
                  option.value = dia;
                  selectOptions.push(option);
            });
            return selectOptions;
      }

      showDay(day) {
            this.itemList = [];
            let item;
            if (this.objData[day]) {
                  this.keyIndex = this.objData[day].length;
                  this.objData[day].forEach( slot => {
                        item = {id: this.keyIndex, open: slot[0]+":"+slot[1], close: slot[2]+":"+slot[3]};
                        this.itemList = [...this.itemList, item];
                        ++this.keyIndex;
                  });
            } else {
                  item = {id: this.keyIndex, open: "", close: ""};
                  this.itemList = [...this.itemList, item];
            }
      }

      changeDay(event) {
            this.currentDay = event.detail.value;
            this.showDay(this.currentDay);
      }

      addRow() {
          ++this.keyIndex;
          let newItem = [{ id: this.keyIndex }];
          this.itemList = this.itemList.concat(newItem);
      }
  
      removeRow(event) {
          if (this.itemList.length >= 2) {
              this.itemList = this.itemList.filter( element => {
                  return parseInt(element.id) !== parseInt(event.target.accessKey);
              });
          }
      }

      handleSubmit(){
           this.objData[this.currentDay] = [];
           let timeSlot = [];
           let timeSlots = this.template.querySelectorAll('lightning-input');
           for(let i=0; i<timeSlots.length; i += 2) {
                 if (timeSlots[i].value && timeSlots[i+1].value) {
                        let openHours = timeSlots[i].value.split(":").map( item => +item);
                        let closeHours = timeSlots[i+1].value.split(":").map( item => +item);
                        timeSlot = [...openHours, ...closeHours];
                        this.objData[this.currentDay].push(timeSlot);
                 } else {
                       this.objData[this.currentDay] = null;
                 }
                  
           }

            const fields = {};
            fields[ACCOUNT_ID.fieldApiName] = this.recordId;
            fields[ACCOUNT_HORARIO_GOOGLE.fieldApiName] = JSON.stringify(this.objData);

            const recordInput = { fields };

            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Horario actualizado',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error actualizando el horario',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
      }

}