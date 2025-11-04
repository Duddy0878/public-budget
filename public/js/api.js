export async function fetchApi(api) {
  try {
    const res = await fetch(api);
    if (!res.ok) throw new Error(`Failed to fetch ${api}: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err; // important
  }
}

export async function addToApi(api,transaction){
 
   try{     
        const res = await fetch(api, {
            method: 'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(transaction)
        })
        if (!res.ok) throw new Error(`Failed to add to ${api}: ${res.status}`);
        return await res.json(); 
    }catch(error){
    console.error(`Error adding ${api}:`, error);
    }
}

export async function updateToApi(api,id,updates){
    try{
        const res = await fetch(`${api}/${id}`, {
            method:'PATCH',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updates)
        })
        if(res.ok){
          return  true;
        }
    }catch(error){
        console.error("Error updating ${api}:",error);
    }
}

export async function deleteFromApi(api,id,toUpdate){

    try{
      const res = await fetch(`${api}/${id}?toUpdate=${toUpdate}`,{
          method:"DELETE",
          headers:{
              "Content-Type":"application/json"
          }
      })
        if(res.ok){
            return true;
        }
    }catch(error){
    console.error("Error deleting ${api}:",error);
    }

}

export async function getTotalApi(api,type,period,wallet_id=''){
    try{
        const res = await fetch(`${api}/total?wallet_id=${wallet_id}&type=${type}&period=${period}`);
        if(!res.ok)throw new Error(`Failed to fetch total from ${api}: ${res.status}`);
        const data = await res.json();
        return data.total;
    }catch(err){
        console.error(err);
        return 0.00;
    }
}
export async function getTotalByMonth(category_id,wallet_id){
    try{
        const res = await fetch(`transactions/totalByMonth?wallet_id=${wallet_id}&category_id=${category_id}`);
        if(!res.ok)throw new Error(`Failed to fetch total from: ${res.status}`);
        const data = await res.json();
        return data.result;
    }catch(err){
        console.error(err);
        return 0.00;
    }
}

export async function getCategorysStatistics(type,period = 'none',wallet_id=''){
    try{
        const res = await fetch(`categories/statistics?type=${type}&period=${period}&wallet_id=${wallet_id}`);
        if(!res.ok)throw new Error(`Failed to fetch statistics from ${api}: ${res.status}`);
        const data = await res.json();
        return data;
    }catch(err){
        console.error(err);
        return [];
    }
}
    

export async function getNotificationsByType(type){

    try{
        const res = await fetch(`notifications/type?type=${type}`);
        if(!res.ok)throw new Error(`Failed to fetch notifications from ${api}: ${res.status}`);
        const data = await res.json();
        return data;
    }catch(err){
        console.error(err);
        return [];
    }
}

export async function pdfDownload(month){
    try{
      window.open(`printers/pdf?month=${month}&download=true`);
    }catch(error){
      console.error("Error Downloading PDF:",error);
    }
}
export async function pdfView(month){
    try{
      window.open(`printers/pdf?month=${month}&download=false`);
    }catch(error){
      console.error("Error Loading PDF:",error);
    }
}
export async function pdfPrint(month){
    try{
      window.open(`printers?month=${month}`);
    }catch(error){
      console.error("Error printing:",error);
    }
}