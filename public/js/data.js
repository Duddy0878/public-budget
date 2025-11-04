import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
export var data = {}

export function loadData() {
       return new Promise((resolve, reject) => {
        
        var fetchData = new XMLHttpRequest();

        fetchData.onload = function() {
         if(fetchData.status === 200){

              let json;
              if(fetchData.responseType === 'json'){
                     json = fetchData.response;
              }
              else{
                     json = JSON.parse(fetchData.response)
              }

              Object.assign(data,json);
              resolve(data);
         }
         else{
              console.error('Error loading request:', fetchData.statusText);
              reject(new Error('Failed to load data')); // Reject the Promise on error 
         }

       }

        fetchData.open('GET', 'data.json', true);
        fetchData.setRequestHeader('Accept', 'application/json');
        fetchData.responseType = 'json';
        fetchData.send();

       })
}

export function saveDataToStorage(datastring){

       function sortByDate(transaction){
       return [...transaction].sort((a,b)=>{
        return dayjs(a.date).diff(dayjs(b.date),'day')
       })
       }

      var sortedTrans = sortByDate(datastring.transactions)
      datastring.transactions = sortedTrans

       

       const postData = new XMLHttpRequest();

       postData.onload = () => {
              if(postData.status === 200){
                     console.log('data saved succsesfuly');
                     
              }
              else{
                     console.log('error saving data,', postData.statusText);
                     
              }
       }

       postData.open('POST', 'data.json'); 
       postData.setRequestHeader('Content-Type', 'application/json');
       postData.send(JSON.stringify(datastring));
}