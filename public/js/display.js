import {
    fetchApi,
    addToApi,
    updateToApi,
    deleteFromApi,
    getTotalApi,
    getTotalByMonth,
    getCategorysStatistics,
    generateCateStatisticsById,
    getNotificationsByType,
    pdfPrint,
    pdfDownload,
    pdfView
} from "./api.js";
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

import { data, loadData ,saveDataToStorage } from "./data.js";


if(!localStorage.getItem('hidden')){
    localStorage.setItem('hidden', 'false')
}
if(!localStorage.getItem('walletHidden')){
    localStorage.setItem('walletHidden', 'false')
}

loadData().then(async () => {
    console.log(data);

let transactions
    transactions = await fetchApi('transactions');
    
let wallets
    wallets = await fetchApi('wallets');

let categories
    categories = await fetchApi('categories');

// let notifications 
//     notifications = await fetchApi('notifications');



// #region data base fix
async function categorysSaver() {
let categoriesgh = await fetchApi('categories');
console.log('categories:', categoriesgh);
// e.g., render to UI
// renderWalletList(wallets);
var began = data.transactions

began.forEach(e => {

    categoriesgh.forEach(cat => {
        if(e.category == cat.name){
            e.category = cat.id

        }
    }
    )
})

data.transactions = began
saveDataToStorage(data)

began.forEach(e => {

    if(e.category.length > 2){
        e.category = 12}
})

data.transactions = began
saveDataToStorage(data)

}

// categorysSaver();

async function walletSaver() {
  let walletsgh = await fetchApi('wallets');
  console.log('wallets:', walletsgh);
  // e.g., render to UI
  // renderWalletList(wallets);
 var began2 = data.transactions

 began2.forEach(e => {
    walletsgh.forEach(wal => {
        if(e.wallet === wal.name){
            e.wallet = wal.id
        }
    }
    )
     
 })

 data.transactions = began2

 saveDataToStorage(data)
 console.log(data.transactions);
}

// walletSaver();

console.log(wallets);

function dateEnterdSaver(){
 data.transactions.forEach(e => {
    e.dateEnterd = dayjs(e.dateEnterd).format("YYYY-MM-DD HH:mm:ss")
 })
}
// dateEnterdSaver();
function dateSaver(){
 data.transactions.forEach(e => {
    e.date = dayjs(e.date).format("YYYY-MM-DD")
 })
 saveDataToStorage(data)
}

// dateSaver();

 function finalSaver(){

        var gggg = data.transactions

        gggg.forEach(e => {
        addToApi('transactions', e)
})
 }

//  finalSaver();


// #endregion



// display the current page =============================

function displayNow(menuItem, displayItem, addedClass){

    menuItem.addEventListener('mouseover', ()=> {
         document.querySelectorAll('.display div').forEach(item => item.classList.remove(addedClass));
        displayItem.classList.add(addedClass)
    })
}

displayNow(document.getElementById('homePage'), document.querySelector('.homePage'), 'openNow');

displayNow(document.getElementById('transactions'), document.querySelector('.transactions'), 'openNow');

displayNow(document.getElementById('wallet'), document.querySelector('.wallet'), 'openNow');

displayNow(document.getElementById('notifications'), document.querySelector('.notifcations'), 'openNow'); 

displayNow(document.getElementById('statistics'), document.querySelector('.statistics'), 'openNow'); 

displayNow(document.getElementById('goal'), document.querySelector('.goal'), 'openNow'); 

displayNow(document.getElementById('maaser'), document.querySelector('.premium'), 'openNow'); 

displayNow(document.getElementById('settings'), document.querySelector('.premium'), 'openNow'); 


// #region home page =======


    // bottem ==

var weekly = document.querySelector('.weekly')
var monthly = document.querySelector('.monthly')
var yearly = document.querySelector('.yearly')

async function statisticHtml(cPeriod, nPeriod, func = false){

    const income = await getTotalApi('transactions', 'income', nPeriod);

    const expense = await getTotalApi('transactions', 'expense', nPeriod);

    const total = await getTotalApi('transactions', 'all', nPeriod);

    func ? cPeriod.innerHTML = `
    <div class="incomes1">This ${nPeriod} Income Is <br> ~ ${formatMoney(income)} ~</div>
    <div class="expenses1">This ${nPeriod} expenses Is <br>~ ${formatMoney(expense)} ~</div>
    <div class="total1">This ${nPeriod} Total Is <br> ~ ${formatMoney(total)} ~</div>
     ` : cPeriod.innerHTML = `
    <div class="incomes1">This ${nPeriod} Income Is <br> ~ Loading ~</div>
    <div class="expenses1">This ${nPeriod} expenses Is <br>~ Loading ~</div>
    <div class="total1">This ${nPeriod} Total Is <br> ~ $Loading ~</div>
     `;
}

statisticHtml(weekly, 'week')
statisticHtml(monthly, 'month')
statisticHtml(yearly, 'year')

statisticHtml(weekly, 'week', true)
statisticHtml(monthly, 'month', true)
statisticHtml(yearly, 'year' ,true)



displayNow(weekly, weekly, 'top')

displayNow(monthly, monthly, 'top')

displayNow(yearly, yearly, 'top')

// #endregion

// #region Transactions ================
        

         // filter

        var filterDrop = document.querySelector('.filterDrop')
        var filterCategory = document.getElementById('filterCategorys')
        var filterWallet = document.getElementById('filterWallets')
        var filterDate = document.getElementById('filterDates')
        var filterType = document.getElementById('filterTypes')

        filterDrop.parentElement.addEventListener('mouseover', ()=>{
            filterDrop.style.display = 'block';
        })
        filterDrop.parentElement.addEventListener('mouseout', ()=>{
            filterDrop.style.display = 'none';
        })

        document.querySelector('.tableCon tbody').addEventListener('mouseover', ()=>{
            filterCategory.value = 'none'
            filterWallet.value = 'none'
            filterDate.value = 'none'
            filterType.value = 'none'
        })
        

        htmlGenertater(categories, filterCategory,'Category')
        htmlGenertater(wallets, filterWallet, 'Wallet')

        var apllyFilter = document.querySelector('.filter button')
         var newTransaction = false;
        apllyFilter.addEventListener('click', ()=>{
           newTransaction = []

            for(let transaction of transactions){
                // Check if first two characters of date match selected month
                var dateMonth = transaction.date.substring(5,7);
                console.log(dateMonth);
                var monthMatches = (filterDate.value === 'none' || filterDate.value === dateMonth);
                
                if((filterCategory.value == transaction.category_id || filterCategory.value === 'none') &&  
                (filterWallet.value == transaction.wallet_id || filterWallet.value === 'none') && 
                monthMatches && 
                (filterType.value === transaction.type|| filterType.value === 'none')){
                newTransaction.push(transaction)
                }
            }
        
            
        
            updateTransactionTable(newTransaction);
        })




       //   sort

        var sortDrop = document.querySelector('.sortDrop')
        var sortedTransactions = []
        sortDrop.parentElement.addEventListener('mouseover', ()=>{
            sortDrop.style.display = 'block';
        })
        sortDrop.parentElement.addEventListener('mouseout', ()=>{
            sortDrop.style.display = 'none';
        })

        function sortByDate(transactions){
          return [...transactions].sort((a,b)=>{
              return dayjs(a.date).diff(dayjs(b.date),'day')
          })
        }
        var byDate = document.getElementById('byDate')
        byDate.addEventListener('click', ()=>{
           sortedTransactions = sortByDate(transactions)
           updateTransactionTable(sortedTransactions)
        })

        function sortByAmount(transactions){
            return [...transactions].sort((a,b)=>{
                return a.amount-b.amount
            })
        }
        var byAmount = document.getElementById('byAmount')
        byAmount.addEventListener('click', ()=>{
            sortedTransactions = sortByAmount(transactions)
            updateTransactionTable(sortedTransactions)
         })

        function sortByType(transactions){
        return [...transactions].sort((a,b)=>{
            return b.type.localeCompare(a.type)
        })
        }
        var byType = document.getElementById('byType')
        byType.addEventListener('click', ()=>{
            sortedTransactions = sortByType(transactions)
            updateTransactionTable(sortedTransactions)
            
         })

        function sortByCategory(transactions){
        return [...transactions].sort((a,b)=>{
            return b.category_id - a.category_id
        })
        }
        var byCategory = document.getElementById('byCategory')
        byCategory.addEventListener('click', ()=>{
            sortedTransactions = sortByCategory(transactions)
            updateTransactionTable(sortedTransactions)
         })

        function sortByWallet(transactions){
        return [...transactions].sort((a,b)=>{
            return b.wallet_id - a.wallet_id
        })
        }
        var byWallet = document.getElementById('byWallet')
        byWallet.addEventListener('click', ()=>{
            sortedTransactions = sortByWallet(transactions)
            updateTransactionTable(sortedTransactions)
         })
         

        //  search
         
         var search = document.querySelector('.search input')

         search.addEventListener('keyup', ()=>{
            var searched = []
            console.log(search.value);

            var searchTerm = search.value.toLowerCase();
            
            for(let transaction of transactions){
                var categoryMatch = getAnyById(transaction.category_id,categories).name
                var walletMatch = getAnyById(transaction.wallet_id,wallets).name
                // Search across multiple fields
                var matchesSearch = 
                    transaction.description?.toLowerCase().includes(searchTerm) ||
                    categoryMatch.toLowerCase().includes(searchTerm) ||
                    walletMatch.toLowerCase().includes(searchTerm) ||
                    transaction.type.toLowerCase().includes(searchTerm) ||
                    transaction.amount.toString().includes(searchTerm) ||
                    transaction.date.includes(searchTerm);
                
                if(matchesSearch){
                    searched.push(transaction)
                }
            }

            updateTransactionTable(searched);
         })

        //  print
        var print = document.querySelector('.print');
       
        print.addEventListener('click', () => {
              pdfSelect();
              actulPdfSelect(pdfPrint);
        });

        // download pdf
        
        document.querySelector('.download').addEventListener('click', () => {
              pdfSelect();
              actulPdfSelect(pdfDownload);
        });

        // pdf view

        document.querySelector('.pdf').addEventListener('click', () => {
              pdfSelect();
              actulPdfSelect(pdfView);
              console.log('hi');
        })

        // pdf selection

        const pdfSelect = () => {
            document.querySelector('.pdfSelect').innerHTML = '';
            const container = document.createElement('div');
            container.innerHTML = `
              <div class="thisMonth">This Month</div>
                <div class="selectMonth"> 
                   <select> 
                    <option>Select month</option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                    </select>
              </div>
              <div class="all"> All</div>
            `

            document.querySelector('.pdfSelect').appendChild(container);
        
        
           };

        const actulPdfSelect = (functions) => {
            document.querySelector('.pdfSelect').addEventListener('click', (e) => {
                let i = 0;
                if(e.target.classList.contains('thisMonth')){
                    i = 1;
                    functions(dayjs().format('MM'));
                }
                else if(e.target.parentElement.classList.contains('selectMonth')){
                    document.querySelector('.selectMonth select').addEventListener('change', (event)=>{
                        functions(event.target.value);
                        document.querySelector('.pdfSelect').innerHTML = '';
                    });

                }
                else if(e.target.classList.contains('all')){
                    i = 1;
                    functions('none');
                }

                if(i > 0){
                  window.location.reload();
                }

            });
        }

        //   refresh

       document.querySelector('.refresh').addEventListener('click', function () {
           updateTransactionTable(sortByDate(getTransactions));
       });
       

       // big view

       document.querySelector('.bigView').addEventListener('click', function () {
        console.log('hi');
         var getHtml = document.querySelector('.tableCon').innerHTML;
         var newWindow = window.open('', '_blank');
         const rowsPerTable = 14; // tweak for your layout
         const multiTablesHtml = splitTableHtml(getHtml, rowsPerTable, true, true);
         var pagesHTML = [];
         for(let i = 0; i< multiTablesHtml.length; i++){
           pagesHTML.push(`
             <div class="page">
               ${multiTablesHtml[i]}
               <div class="page-number" style="text-align: center; color: #b44c4c; margin-top: 10px; font-size: 17px ">Page ${i + 1} / ${multiTablesHtml.length}</div>
             </div>
           `);
         }
         console.log(multiTablesHtml);
         
         newWindow.document.close();
         newWindow.document.write(`
        <html>
            <head>
            <title>Budget Report</title>
            <link rel="stylesheet" href="./css/style.css">
            <style>

                body {
                    background: var(--myBackground) !important;
                    overflow: visible !important;
                    overflow-y: hidden !important;
                }

                ::-webkit-scrollbar {
                    width: 20px;
                    height: 10px;
                }

                ::-webkit-scrollbar-thumb {
                     background: var(--myRed);
                    border-radius: 15px;
                    border: 16px solid var(--myRed);
                }

                /* Disable the fixed-height scroller from app CSS */
                .tableCon { height: auto !important; overflow: visible !important; border: none; }

                .tableCon table td:last-child, th:last-child {
                    display: none;
                }

                .tableCon table th{
                 font-size: 22px;
                 
                }

                // .tableCon table td:nth-child(3), td:nth-child(4), th:nth-child(3), th:nth-child(4) {
                //     width: 100px;

                // }

                /* Place tables side-by-side and wrap to the next line when full */
                .tablesWrap {
                display: flex;
                // flex-wrap: wrap;
                gap: 16px;
                align-items: flex-start;
                }

                /* Set a consistent width so columns align nicely */
                .tablesWrap table {
                flex: 0 0 auto;
                width: 720px; /* adjust to fit your page width */
                }

                /* Optional: nicer print handling */
                @media print {
                .tablesWrap table { break-inside: avoid; page-break-inside: avoid; }
                }
            </style>
            </head>
            <body style="background: var(--myBackground) !important;">
            <div class="bigg">
                <div class="tableCon">
                <div class="tablesWrap">
                    ${pagesHTML}
                </div>
                </div>
            </div>
            </body>
        </html>
        `);


       });

       // Split a single HTML table string into multiple tables by rows-per-table

        function splitTableHtml(html, rowsPerTable = 25, repeatHeader = true, footerOnLastOnly = true) {
        const container = document.createElement('div');
        container.innerHTML = html.trim();

        const originalTable = container.querySelector('table');
        if (!originalTable) return html;

        const thead = originalTable.querySelector('thead');
        const tfoot = originalTable.querySelector('tfoot');

        let rows = Array.from(originalTable.querySelectorAll('tbody tr'));
        if (rows.length === 0) {
            rows = Array.from(originalTable.querySelectorAll('tr'))
            .filter(tr => tr.closest('thead') === null && tr.closest('tfoot') === null);
        }

        const tablesHtml = [];
        for (let i = 0; i < rows.length; i += rowsPerTable) {
                       
            const newTable = originalTable.cloneNode(false); // keep attributes/classes
            if (repeatHeader && thead) newTable.appendChild(thead.cloneNode(true));

            const tbody = document.createElement('tbody');
            for (const row of rows.slice(i, i + rowsPerTable)) {
            tbody.appendChild(row.cloneNode(true));
            }
            newTable.appendChild(tbody);

            const isLast = i + rowsPerTable >= rows.length;
            if (tfoot && (!footerOnLastOnly || isLast)) newTable.appendChild(tfoot.cloneNode(true));

            tablesHtml.push(newTable.outerHTML);

        }

        return tablesHtml;
        }

        // hide total 
        var hidden =  localStorage.getItem('hidden')



        displayVisible('hideTOTAL','hidden');

        
        document.querySelector('.hideTOTAL').addEventListener('click', ()=>{    hidden = localStorage.getItem('hidden')
            var hide = document.querySelectorAll('sub')
            if(hidden === true || hidden === 'true'){
                querySelectorAllStyle(hide, {display: 'block'});
                hidden = false
            }
            else{
                querySelectorAllStyle(hide, {display: 'none'});
                hidden = true
            }
           localStorage.setItem('hidden', hidden)
           displayVisible('hideTOTAL','hidden');
         }
        )




        //   edit transaction delete transaction

        const tableContainer = document.querySelector('.tableCon');
        

        tableContainer.addEventListener('click', async (e) => {
        if (!e.target.closest('svg')) return; 
          const btnGet = e.target.closest('svg');
          var delID = btnGet.dataset.id
          var currentTrans = getAnyById(delID,transactions);
          if(btnGet.dataset.type === 'edit'){
            document.querySelector('.modalEdit').style.display = 'flex';
                document.querySelector('.modalEdit').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#b44c4c"><path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z"/></svg>
                    <input type="date" value="">
                    <input type="number" placeholder="${currentTrans.amount}">
                    <select class="typeS">
                        <option value="income" ${currentTrans.type === 'income' ? 'selected' : ''}>Income</option>
                        <option value="expense" ${currentTrans.type === 'expense' ? 'selected' : ''}>Expense</option>
                    </select>
                    <select class="catgoryS">

                    </select>
                    <input type="text" placeholder="${currentTrans.description}">
                    <select class="walletS">

                    </select>
                    <button class="saveBtn">Save</button>
                `;

        htmlGenertater(categories, document.querySelector('.modalEdit .catgoryS'), getAnyById(currentTrans.category_id, categories).name)
        htmlGenertater(wallets, document.querySelector('.modalEdit .walletS'), getAnyById(currentTrans.wallet_id, wallets).name)

        document.querySelector('.modalEdit .saveBtn').addEventListener ('click', async ()=>{
            var change = false;
            var acountS = currentTrans.wallet_id
            let newArrey = {}


            function codeSaver(happen){
                if(document.querySelector(`.modalEdit ${happen}`).value !== '' && document.querySelector(`.modalEdit ${happen}`).value !== 'none' && document.querySelector(`.modalEdit ${happen}`).value !== currentTrans.type ){

                change = true;

                return document.querySelector(`.modalEdit ${happen}`).value;
                }
             }
            

            newArrey.date = codeSaver('input[type="date"]')
            newArrey.amount = codeSaver('input[type="number"]')
            newArrey.type = codeSaver('.typeS')
            newArrey.category_id = codeSaver('.catgoryS')
            newArrey.wallet_id = codeSaver('.walletS')
            newArrey.description = codeSaver('input[type="text"]')
    

            if(change === true){

                if(newArrey.wallet_id == undefined){
                   newArrey.wallet_id = acountS
                }

            const response = await updateToApi('transactions',delID,newArrey)
            if(!response){
                swal.fire(
                    {
                        icon:'error',
                            title:`Something Went Wrong, Please Try Again`
                  })
                  return;
            }

            swal.fire(
                    {
                        icon:'success',
                        iconColor:'#b44c4c',
                        title:`Transaction Updated Successfully`,
                        color: '#b44c4c',
                        background: '#f8f4f4',
                        timer: 2000,
                        showConfirmButton: false,
                    },
                )
            await addToApi('notifications',{trans_id:delID,type:'edited',msg: `A transaction of $${getAnyById(delID,transactions).amount} For The ${getAnyById(getAnyById(delID,transactions).category_id,categories).name} Was Edited.`,auther:0})

            let loadTransactions = await fetchApi('transactions');

            updateTransactionTable(sortByDate(loadTransactions))

            document.querySelector('.modalEdit').innerHTML = 'Changes Saved!';

            document.querySelector('.modalEdit').style.display = 'none';
            }
            else{
                swal.fire(
                    {
                        icon:'info',
                        iconColor:'#b44c4c',
                        title:`No changes made to the transaction.`,
                        color: '#b44c4c',
                        background: '#f8f4f4',
                        timer: 2000,
                        showConfirmButton: false,
                    },
                );
             document.querySelector('.modalEdit').innerHTML = '';
             document.querySelector('.modalEdit').style.display = 'none';
            }

        })
        document.querySelector('.modalEdit svg').addEventListener('click',()=>{
            document.querySelector('.modalEdit').innerHTML = ''
            document.querySelector('.modalEdit').style.display = 'none';
        })
          }
          else if(btnGet.dataset.type === 'delete'){
                
                swal.fire(
                    {
                    icon:'warning',
                    iconColor:'#b44c4c',
                    title:`Are you sure you want to delete this Transaction?`,
                    color: '#b44c4c',
                    background: '#f8f4f4',
                    showCancelButton: true,
                    confirmButtonColor: '#b44c4c',
                    confirmButtonText: "Yes, delete it!",
                    allowOutsideClick:false,
                    }
                ).then(async(result) => {
                    if(result.isConfirmed){   
                    var wallet =  getAnyById(delID,transactions).wallet_id     
                    const response = await deleteFromApi('transactions',delID,wallet)  
                    if(!response){
                        swal.fire(
                            {
                                icon:'error',
                                    title:`Something Went Wrong, Please Try Again`
                      })
                    }
                    await addToApi('notifications',{trans_id:null,type:'deleted',msg: `A transaction of $${getAnyById(delID,transactions).amount} For The ${getAnyById(getAnyById(delID,transactions).category_id,categories).name} was deleted.`,auther:0})
                    const loadTransactions = await fetchApi('transactions');
                    updateTransactionTable(sortByDate(loadTransactions))
                    swal.fire(
                        {
                            icon:'success',
                            iconColor:'#b44c4c',
                            title:`Transaction Deleted Successfully`,
                            color: '#b44c4c',
                            background: '#f8f4f4',
                            timer: 2000,
                            showConfirmButton: false,
                        },
                    )
                    }
                })
          }

            
        })

        var getTransactions = transactions
        updateTransactionTable(sortByDate(transactions));

// #endregion

// #region Wallet ===========

async function displayWallet(){

var walletsInner = document.querySelector('.allWallets')
var walletHTML = '';

for(let i = 0; i< wallets.length; i++){
    if(i == 0 && wallets[0].balance <= 0){
        i++
    }
    const income = await getTotalApi('transactions','income','none', wallets[i].id)
    const expense = await getTotalApi('transactions','expense','none', wallets[i].id)

   walletHTML+= `
      <div class="walletBox" data-name-id="get${wallets[i].name}" data-id="${wallets[i].name}">
        ${capitilizeFirstLetter(wallets[i].name)} <svg class="expandWallet" xmlns="http://www.w3.org/2000/svg" height="29px" viewBox="0 -960 960 960" width="29px" fill="#1f1f1f"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>
    </div>

    <div class="get${wallets[i].name} hidden"> 
        <div class="one">
            ${capitilizeFirstLetter(wallets[i].name)} = ${formatMoney(wallets[i].balance)} <br>
            ------------------------- <br>
            <a>See all transactions</a>
        </div>
        <div class="two">
            Income = ${formatMoney(income)} <br>
            Expense = ${formatMoney(expense)} 
        </div>
    </div>
   `
}

walletsInner.innerHTML = walletHTML

var walletBoxes = document.querySelectorAll('.walletBox')
var nowOpen;
    walletBoxes.forEach((box)=> {
        box.addEventListener('click', ()=> {
        var click = box.dataset.nameId

        document.querySelectorAll('.wallets div').forEach((div) => {
            div.classList.remove('expanded')
            document.querySelector(`.${click}`).classList.add('expanded')

        })
        })
    })

     walletBoxes.forEach((icon) => {
        icon.addEventListener('dblclick', (event) => {
     
                document.querySelectorAll('.wallets div').forEach((div) => {
                div.classList.remove('expanded')
            }) 
            
        })
    })

    // wallets total

    var walletsTotal = document.querySelector('.walletsTotal')
    var hideBtn = document.querySelector('svg.hide')

    displayVisible('hide', 'walletHidden')

    function checkHidden(){
    var getLS = localStorage.getItem('walletHidden')
        
     if(getLS === true || getLS === 'true'){
       walletsTotal.innerHTML = walletshidenHTML
     }
     else{
        walletsTotal.innerHTML = walletsTotalHTML
     }
    }

    const total = await getTotalApi('transactions','all' ,'none')

    var walletsTotalHTML = ` Your Total Worth Is  &nbsp; ${formatMoney(total)}`
    var walletshidenHTML = '**********************'

    checkHidden();

    hideBtn.addEventListener('click', ()=>{
     var g = localStorage.getItem('walletHidden')
     if(g === true || g === 'true'){
        g = false
     }
     else{
        g = true
     }
     localStorage.setItem('walletHidden',g)
     checkHidden();
     displayVisible('hide','walletHidden')
     
    }) 

}
displayWallet()

var editWallets = document.querySelector('.editWallets')
var editWalletsHTML = editWallets.innerHTML

buttonsForWalets()
var clicked = false;
function buttonsForWalets(){
    clicked = false;
   document.getElementById('createW').addEventListener('click', () => {
       editWallets.innerHTML = `
                       <input type="text" placeholder="Wallet Name">
                       <div id="newCancel">
                           Cancel
                       </div>
                       <div id="submit" data-action="create">
                           Create New Wallet
                       </div>
       `
       clicked = true;
       addListener()

   })

   document.getElementById('editW').addEventListener('click', () => {
            editWallets.innerHTML = `
                       <input type="text" placeholder="Wallets New Name">
                       <select>
                           
                       </select>
                       <div id="newCancel">
                           Cancel
                       </div>
                       <div id="submit" data-action="edit">
                           Submit Change
                       </div>
       `
       htmlGenertater(wallets,document.querySelector('.editWallets select'),'Wallets')
       clicked = true;
       addListener()
   })

   document.getElementById('deleteW').addEventListener('click', () => {
            editWallets.innerHTML = `
                       <input type="text" placeholder="Confirm Wallet Name">
                       <select>
                           <option value="none">Select Wallet</option>
                       </select>
                       <div id="newCancel">
                           Cancel
                       </div>
                       <div id="submit" data-action="delete">
                           Delete
                       </div>
       `
       htmlGenertater(wallets,document.querySelector('.editWallets select'),'Wallets')
       clicked = true;
       addListener()
   })

}

 async function addListener() {
       if(clicked == true){
           document.getElementById('newCancel').addEventListener('click', () => {
              

                editWallets.innerHTML = editWalletsHTML;
                buttonsForWalets()
           })
           document.getElementById('submit').addEventListener('click', async () => {
              var click = document.getElementById('submit').getAttribute('data-action');

              if(document.querySelector('.editWallets input').value.trim() === ''){
                  swal.fire({
                      icon: 'error',
                      title: 'Oops... Wallet name is required',
                      text: 'Please enter a wallet name',
                      iconColor:'#b44c4c',
                      background: '#f8f4f4',
                      color: '#b44c4c',
                      confirmButtonColor: '#b44c4c'
                  })
                  return;
              }

              else if(document.querySelector('.editWallets select') && document.querySelector('.editWallets select').selectedIndex === 0){
                  swal.fire({
                      icon: 'error',
                      title: 'Oops... Wallet not selected',
                      text: 'Please select a wallet to edit or delete',
                      iconColor:'#b44c4c',
                      background: '#f8f4f4',
                      color: '#b44c4c',
                      confirmButtonColor: '#b44c4c'
                  })
                  return;
              }

              if(click === 'create'){
                var newWallet = document.querySelector('.editWallets input').value.trim().toLowerCase();
                // data.wallets.push({name: newWallet, balance: 0});
                // saveDataToStorage(data);
                const newWalletToSend = {
                    name: newWallet,
                    balance: 0
                }
                const response = await addToApi('wallets', newWalletToSend);
                if(!response){
                    swal.fire({
                        icon:'error',
                        title:`Something Went Wrong, Please Try Again`,showConfirmButton:false
                    })
                    return;
                }

                editWallets.innerHTML = editWalletsHTML;
                wallets = await fetchApi('wallets');
                await displayWallet();
                buttonsForWalets();
              }

              else if(click === 'edit'){
                const editWallet = document.querySelector('.editWallets input').value.trim()
                const selectedIndex = document.querySelector('.editWallets select').value;

                const walletToUpdate = {
                    name: editWallet
                }

                const response = await updateToApi('wallets', selectedIndex, walletToUpdate);

                if(!response){
                    swal.fire({
                        icon:'error',
                        title:`Something Went Wrong, Please Try Again`,showConfirmButton:false
                    })
                    return;
                }

                editWallets.innerHTML = editWalletsHTML;
                wallets = await fetchApi('wallets');
                await displayWallet();
                buttonsForWalets();
              }

              else if(click === 'delete'){
                var deleteWallet = document.querySelector('.editWallets input').value.trim().toLowerCase();
                var walletIndex = document.querySelector('.editWallets select').value;
                const nameToGet = getAnyById(walletIndex, wallets).name.toLowerCase();
                if(deleteWallet === nameToGet){
                await deleteFromApi('wallets', walletIndex,'none')
                
                editWallets.innerHTML = editWalletsHTML;
                wallets = await fetchApi('wallets');
                await displayWallet();
                buttonsForWalets();
                }
                else{
                    swal.fire({
                        icon: 'error',
                        title: 'Oops... Wallet name does not match',
                        text: 'Please Confirm The Wallet You Want To Delete (case sensitive )',
                        iconColor:'#b44c4c',
                        background: '#f8f4f4',
                        color: '#b44c4c',
                        confirmButtonColor: '#b44c4c'
                    })
                    
                }
                
              }
           })
   }
 }


// #endregion

// #region statistics

        //    controls
        
    //    htmlGenertater(wallets,document.getElementById('controlWallet'),'All')

    //     var histGrm = document.querySelector('.histGram');
    //     var statisticsContent = document.querySelector('.statisticsContent');
    //     var lineHtml = document.querySelector('.linechart')

    //     document.querySelector('[data-gallary="HistoGram"]').addEventListener('click', ()=>{
    //         statisticsContent.style.display = 'none';
    //         histGrm.style.display = 'block';
    //         lineHtml.style.display = 'none'
    //         document.querySelector('.timeSpan').innerHTML =
    //         `  <label for="">Categorys</label>
    //                     <select name="" id="controlCategory">
                        
                            
    //                     </select>` 
    //         htmlGenertater(categories, document.querySelector('#controlCategory'), 'All')
    //         document.querySelector('.months').style.display = 'none';
    //         controllers();
    //     })

    //     document.querySelector('[data-gallary="DonutChart"]').addEventListener('click', ()=>{
    //         statisticsContent.style.display = 'grid';
    //         histGrm.style.display = 'none';
    //         lineHtml.style.display = 'none'
    //             document.querySelector('.timeSpan').innerHTML = `
    //             <label for="">Time Span</label>
    //             <select name="" id="controlTime">
    //                 <option value="none">All</option>
    //                 <option value="year">Year</option>
    //                 <option value="month">Month</option>
    //                 <option value="week">Week</option>
    //             </select>
    //         `;
    //         document.querySelector('.months').style.display = 'block';
    //         controllers();
    //     })

    //     document.querySelector('[data-gallary="LineChart"]').addEventListener('click', ()=>{
    //         lineHtml.style.display = 'grid'
    //         statisticsContent.style.display = 'none';
    //         histGrm.style.display = 'none';
    //             document.querySelector('.timeSpan').innerHTML = `
    //             <label for="">Time Span</label>
    //             <select name="" id="controlTime">
    //                 <option value="none">All</option>
    //                 <option value="year">Year</option>
    //                 <option value="month">Month</option>
    //                 <option value="week">Week</option>
    //             </select>
    //         `;
    //         document.querySelector('.months').style.display = 'block';
    //         controllers();
    //     })

        function generateRedColors(count){
                const colors = [];
                const baseRed = 180;
                const baseGreen = 76;
                const baseBlue = 76;
        
                    for (let i = 0; i < count.length; i++) {
                    // Calculate lightness factor (0 = darkest, 1 = lightest)
                    const lightnessFactor = i / Math.max(count.length - 1, 1);
                    
                    // Interpolate between base color and lighter version
                    const red = Math.round(baseRed + (255 - baseRed) * lightnessFactor * 0.7);
                    const green = Math.round(baseGreen + (255 - baseGreen) * lightnessFactor * 0.7);
                    const blue = Math.round(baseBlue + (255 - baseBlue) * lightnessFactor * 0.7);
                    
                    colors.push(`rgb(${red}, ${green}, ${blue})`);
            }
           
           return colors;
        
        
        }

           // donut chart

        let cateIncome = [];
        let cateExpense = [];

        async function generateCateStatistics() {
            cateIncome.push(...await getCategorysStatistics('income'));
            cateExpense.push(...await getCategorysStatistics('expense'));
        } 

        async function createDonutChart(data, wich){
            await generateCateStatistics();

            const colorsIn =  generateRedColors(cateIncome);
            const colorsEx =  generateRedColors(cateExpense);

            const pieDataIn = {
                labels: [...cateIncome.map(cate => cate.category)],
                datasets: [{
                    label: 'Total Amount',
                    data: [...cateIncome.map(cate => cate.total)],
                    backgroundColor:colorsIn,
                    hoverOffset: 4
                }]
                };
            const pieDataEx = {
                labels: [...cateExpense.map(cate => cate.category)],
                datasets: [{
                    label: 'Total Amount',
                    data: [...cateExpense.map(cate => cate.total)],
                    backgroundColor:colorsEx,
                    hoverOffset: 4
                }]
                };

            const centerTextIn = {
                id: 'centerText',
                beforeDraw(chart) {
                    const { width } = chart;
                    const { top, bottom, left, right } = chart.chartArea;
                    const ctx = chart.ctx;
                    ctx.save();

                    const text = '~ Income ~'; // 👈 your custom text
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#b44c4c';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const centerX = (left + right) / 2;
                    const centerY = (top + bottom) / 2;
                    ctx.fillText(text, centerX, centerY);

                    ctx.restore();
             }
            };
            const centerTextEx = {
                id: 'centerText',
                beforeDraw(chart) {
                    const { width } = chart;
                    const { top, bottom, left, right } = chart.chartArea;
                    const ctx = chart.ctx;
                    ctx.save();

                    const text = '~ Expense ~'; // 👈 your custom text
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#b44c4c';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const centerX = (left + right) / 2;
                    const centerY = (top + bottom) / 2;
                    ctx.fillText(text, centerX, centerY);

                    ctx.restore();
             }
            };

            const pieOptions = {
                    plugins: {
                        legend: {
                        display: false
                        },
                        tooltip: {
                        displayColors: false,
                        backgroundColor: '#f5e7e7',   // background color
                        titleColor: '#b44c4c',        // title font color
                        bodyColor: '#b44c4c',         
                        titleFont: { size: 16, weight: 'bold' }, // title font
                        bodyFont: { size: 14 },    // body font
                        padding: 14,               // inside padding
                        borderColor: '#b44c4c',       // border color
                        borderWidth: 2, 
                        callbacks: {
                                label: function(context) {
                                    let value = Number(context.raw);
                                    let dataset = context.dataset.data.map(Number);
                                    let total = dataset.reduce((sum, val) => sum + val, 0);
                                    let percentage = ((value / total) * 100).toFixed(2);
                                    return `$${value.toLocaleString()} (${percentage}%)`;
                                }
                                }
                        }
                    }
                }

            const configIn = {
                type: 'doughnut',
                data: pieDataIn,
                options : pieOptions,
                plugins:[centerTextIn]
                };
            const configEx = {
                type: 'doughnut',
                data: pieDataEx,
                options : pieOptions,
                plugins:[centerTextEx]
                };

            const pieChartIn = document.getElementById('pieChartIn')
            const pieChartEx = document.getElementById('pieChartEx')

            new Chart(pieChartIn,configIn)
            new Chart(pieChartEx,configEx)


        }

        createDonutChart()

        // line - donut chart

        let monthTotal = [];

        async function generateMonthStatistics() {
            monthTotal.push(...await getTotalByMonth());
        } 

        function createLineChart(data, wich){

            monthTotal.total = 0;
            monthTotal.forEach(month => {
                month.total = month.income - month.expense;
                monthTotal.total += month.total;
            });

            const lineChartIn = {
                labels: [...monthTotal.map(month => ({
                    month: dayjs(month.month).format('MMMM')
                }).month)],
                datasets: [
                    {
                    label: 'income',
                    data: [...monthTotal.map(month => month.income)],
                    borderWidth: 1
                    },
                    {
                    label: 'expense',
                    data: [...monthTotal.map(month => month.expense)],
                    borderWidth: 1
                    },
                    {
                    label: 'Total',
                    data: [...monthTotal.map(month => month.total)],
                    borderWidth: 3
                    },

                ],
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
                };

            const chartOptions = {
                    plugins: {
                        tooltip: {
                        displayColors: false,
                        backgroundColor: '#f5e7e7',   // background color
                        titleColor: '#b44c4c',        // title font color
                        bodyColor: '#b44c4c',         
                        titleFont: { size: 16, weight: 'bold' }, // title font
                        bodyFont: { size: 14 },    // body font
                        padding: 14,               // inside padding
                        borderColor: '#b44c4c',       // border color
                        borderWidth: 2, 
                        callbacks: {
                                label: function(context) {
                                    let value = Number(context.raw);
                                    return `$${value.toLocaleString()}`;
                                }
                                }
                        }
                    }
                }


            const configIn = {
                type: 'line',
                data: lineChartIn,
                options: chartOptions
                };
                
            const lineChart = document.getElementById('LChart')

            new Chart(lineChart,configIn)
        }
        function createHistoChart(data, wich){

            monthTotal.total = 0;
            monthTotal.forEach(month => {
                month.total = month.income - month.expense;
                monthTotal.total += month.total;
            });

            const lineChartIn = {
                labels: [...monthTotal.map(month => ({
                    month: dayjs(month.month).format('MMMM')
                }).month)],
                datasets: [
                    {
                    label: 'income',
                    data: [...monthTotal.map(month => month.income)],
                    backgroundColor: '#d19090ff'
                    },
                    {
                    label: 'expense',
                    data: [...monthTotal.map(month => month.expense)],
                    backgroundColor: '#b44c4c'
                    }

                ],
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
                };
            const chartOptions = {
                    plugins: {
                        tooltip: {
                        displayColors: false,
                        backgroundColor: '#f5e7e7',   // background color
                        titleColor: '#b44c4c',        // title font color
                        bodyColor: '#b44c4c',         
                        titleFont: { size: 16, weight: 'bold' }, // title font
                        bodyFont: { size: 14 },    // body font
                        padding: 14,               // inside padding
                        borderColor: '#b44c4c',       // border color
                        borderWidth: 2, 
                        callbacks: {
                                label: function(context) {
                                    let value = Number(context.raw);
                                    return `$${value.toLocaleString()}`;
                                }
                                }
                        }
                    }
                }

            const configIn = {
                type: 'bar',
                data: lineChartIn,
                options: chartOptions
                };
                
            const histoChart = document.getElementById('incomeExpenseChart')

            new Chart(histoChart,configIn)
        }

        generateMonthStatistics().then(() => {
            createLineChart();
            createHistoChart();
        });

// #endregion

// #region notification

     let notificationDelete = await getNotificationsByType('deleted')
     let notificationPending = await getNotificationsByType('pending')
     const notificationBox = document.querySelector('.notifcations .eachThreat')

     function pendingUpdate() {
            const typingHtml = 
            ``
        document.querySelectorAll('.notifcations .eachThreat button').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id =  btn.getAttribute('data-id')
                const transId = btn.getAttribute('trans-id');
                const typing = document.querySelector('.typing');
                typing.style.display = 'inline-flex';
                

                document.querySelector('.notifcations .eachThreat .typing svg').addEventListener('click', async () => {
                    const newAmount = document.querySelector('.notifcations .eachThreat .typing input').value;

                    if(newAmount === '' || isNaN(newAmount) || Number(newAmount) <= 0){
                        swal.fire({
                            icon:'error',
                            title:`Please Enter A Valid Amount`,showConfirmButton:false
                        })
                        return
                    }
                    const rs = await updateToApi('transactions', transId, {amount: parseFloat(newAmount),wallet_id: getAnyById(transId,transactions).wallet_id});
                    if(rs){
                    await deleteFromApi('notifications', id, 'none');
                    await addToApi('notifications',{trans_id:transId,type:'pending',msg: `You Updated Transaction #${transId} From $${getAnyById(transId,transactions).amount} to $${newAmount}`,auther:1});
                    }
                    else{
                        swal.fire({
                            icon:'error',
                            title:`Something Went Wrong, Please Try Again`,showConfirmButton:false
                        })
                    }
                    transactions = await fetchApi('transactions');
                    notificationPending = await getNotificationsByType('pending')
                    displayPending();
                    updateTransactionTable(sortByDate(transactions))
                    

                })
            })
        })

     }
    function displayPending(){

        notificationBox.innerHTML = `<div class="typing">
                <input type="number" placeholder="Type The Updated Amount">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#b44c4c"><path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/></svg>
            </div>`;

        for(let i = notificationPending.length - 1; i >= 0; i--){
            if(notificationPending[i].auther == 0){
            notificationBox.innerHTML += `
                <div>
                   Pending Transaction: <br>
                   <p> 
                    A Transaction of $${getAnyById(notificationPending[i].trans_id,transactions).amount} <br> For The Category ${getAnyById(getAnyById(notificationPending[i].trans_id,transactions).category_id, categories).name} might need an update <br>
                    click <button trans-id="${notificationPending[i].trans_id}" data-id="${notificationPending[i].id}">here</button> to update it.
                   </p>
                   <div class="notDate">${dayjs(notificationPending[i].date_created).format('MM/DD/YYYY h:mma')}</div>
                </div>
            `
            }
            else{
                notificationBox.innerHTML += `
                <div class="me">
                   Pending Update: <br>
                   <p> 
                    ${notificationPending[i].msg}
                   </p>
                   <div class="notDate">${dayjs(notificationPending[i].date_created).format('MM/DD/YYYY h:mma')}</div>
                </div>
                `
            }
        }
     }
     function displayDeleted(){

        notificationBox.innerHTML = '';

        for(let i = notificationDelete.length - 1; i >= 0; i--){
            notificationBox.innerHTML += `
                <div>
                   Deleted Transaction: <br>
                   <p>
                   ${notificationDelete[i].msg}
                   </p>
                   <div class="notDate">${dayjs(notificationDelete[i].date_created).format('MM/DD/YYYY h:mma')}</div>
                </div>
            `
        }
     }
    
     function displayNoti(btn, dis, func){
        const click = document.querySelector(`.${btn}`)
        click.addEventListener('click',()=>{
            dis();
            func? func() : null
           
        })
     }

     displayNoti('pend',displayPending,pendingUpdate)
     displayNoti('del',displayDeleted)




     


// #endregion notification

// #region My Goals

async function displayGoals(){
    var budget = 9600.00
    var countSpent = 0
    var countInvest = 0
    var goalsCon = document.getElementById('spendUl')

    for(let i = 0; i< categories.length; i++){

        if(categories[i].name === 'creditCard'){
            console.log(categories[i].name);
            continue;
        }
        const cateSum = await generateCateStatisticsById(categories[i].id);

        if(cateSum == 0.00){
            continue;
        }


        const li = document.createElement('li');
        li.innerText = `${capitilizeFirstLetter(categories[i].name)}: ${formatMoney(cateSum)} `
        goalsCon.appendChild(li);

        if(categories[i].name === 'investing' || categories[i].name === 'savings'){

            countInvest += cateSum;
            continue;
        }

        countSpent += cateSum;

    }

    document.getElementById('monthlyB').innerHTML= formatMoney(budget)
    document.getElementById('spentB').innerHTML = formatMoney(countSpent)
    document.getElementById('investedB').innerHTML = formatMoney(countInvest)
    document.getElementById('leftB').innerHTML = formatMoney(budget - countSpent)
}

displayGoals()



// #endregion My Goals


// #region newIncome/expense

          //   display options


var category = document.querySelector('.category select');
var acount = document.querySelector('.account select');
var descriptionsList = document.getElementById('descriptions');

htmlGenertater(categories, category, 'Category')
htmlGenertater(wallets, acount, 'Wallet')



const openIncome = document.querySelector('.openNewIncome')
const openexpense = document.querySelector('.openNewExpence')
const newModal = document.querySelector('.newModal')
const newModalHeader = document.querySelector('.newModalHeader')
let upToNow = ''
const cover = document.querySelector('.cover');

openIncome.addEventListener('click', ()=> {
    document.querySelectorAll('.display div').forEach(item => item.classList.remove('openNow'));
    newModal.classList.add('openNow')
    cover.style.display = 'block'
    newModalHeader.innerHTML = '<div class="">New Income</div>'
    upToNow = 'income'
    populateDescriptions('income')
})

openexpense.addEventListener('click', ()=> {
    document.querySelectorAll('.display div').forEach(item => item.classList.remove('openNow'));
    newModal.classList.add('openNow')
    cover.style.display = 'block'
    newModalHeader.innerHTML = '<div class="">New expense</div>'
    upToNow = 'expense'
    populateDescriptions('expense')
})

// Populate descriptions datalist
function populateDescriptions(upToNow){
    var uniqueDescriptions = [];
    uniqueDescriptions = [...new Set(
        transactions
            .filter(t => t.type === upToNow)  
            .map(t => t.description)          
            .filter(d => d && d.trim())       
    )];

    uniqueDescriptions.forEach(desc => {
        const option = document.createElement('option');
        option.value = desc;
        descriptionsList.appendChild(option);
    });
}

var amount = document.querySelector('.amount input')
var date = document.querySelector('.date input')
var description = document.querySelector('.description input')

var pendingBTN = document.querySelector('.confirm .pndg > input')
var unknownBTN = document.querySelector('.confirm .unkn > input');




var submit = document.querySelector('.confirm input[type="submit"]')


submit.addEventListener('click', async (e)=> {
    e.preventDefault();
    
    if(date.value == ''){
        date.value = dayjs().format('YYYY-MM-DD')
    }
    if(acount.value === 'none'){
        acount.value = 1
    }
    if(category.value === 'none' ){
        category.value = 21
    }
    if(!amount.value === '' || !amount.value|| amount.value === '0'){
        swal.fire({
            icon:'error',
            title:`Please Enter A Valid Amount`,showConfirmButton:false
        })
        return
    }
    



    // unknownBTN.checked?   createNotification(count, 'unknown') : null

    //     saveNotificationsToStorage(notifications)
  

    // ======

    const newTransaction = {
          wallet_id: acount.value,
          amount: parseFloat(amount.value),
          date: date.value,
          type: upToNow,
          category_id: category.value,
          description: description.value
    }

    console.log(newTransaction);
    
    const createt = await addToApi('transactions', newTransaction)
    const trans_id = createt?.id;
    if(!createt){
        swal.fire({
            icon:'error',
            title:`Something Went Wrong, Please Try Again`,showConfirmButton:false
        })
        return
    }
    pendingBTN.checked?  await addToApi('notifications', {trans_id:trans_id,type:'pending',msg: '',auther:0}) : null
    window.location.reload();
})

var closeNew = document.querySelector('.closeNew')

closeNew.addEventListener('click', ()=>{ 
    amount.value = ''
    acount.value = ''
    category.value =''
    date.value =''
    description.value = ''
    cover.style.display = 'none'
    newModal.classList.remove('openNow')
    document.querySelector('.homePage').classList.add('openNow')
})

// #endregion

// #region functions ======================

function formatMoney(value, locale = 'en-US', currency = 'USD'){
    const number = parseFloat(value)

    const formatter = new Intl.NumberFormat(locale, {
     style: 'currency',
    currency: currency,
  });

    return formatter.format(number);
}

function htmlGenertater(arrey,key,name){
   var Html = `<option value="none">${name}</option>`
    for(arrey of arrey){
     Html +=  `<option value="${arrey.id}">${capitilizeFirstLetter (arrey.name)}</option>`
    }

    key.innerHTML = Html
}

function capitilizeFirstLetter(str){
    if(typeof str !== 'string' || str.length === 0){
        return str
    }
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function updateTransactionTable(transactionsBefore){
    const tbody = document.querySelector('.tableCon tbody')
    let transactionHTML = ''

    let myTransactions = transactionsBefore;

    
    for(let i = 0; i< myTransactions.length; i++){
        let countTrans = 0
        let countWallet = 0
        let currentWallet = myTransactions[i].wallet_id
        var currentId = myTransactions[i].id

        
        for(let u = 0; u< transactions.length; u++){
            if(transactions[u].id <= currentId){
               if(transactions[u].type === 'income'){
                 countTrans += Math.round(Number(transactions[u].amount)*100)
                if(transactions[u].wallet_id === currentWallet){
                 countWallet += Math.round(Number(transactions[u].amount)*100)
                }
               }
               else{
                countTrans -= Math.round(Number(transactions[u].amount)*100)
                if(transactions[u].wallet_id === currentWallet){
                 countWallet -= Math.round(Number(transactions[u].amount)*100)
                }
               }
            }
        }

       transactionHTML = ` 
        <tr>
            <td>${dayjs(myTransactions[i].date).format("MM/DD/YYYY")}</td>
            <td>${formatMoney(myTransactions[i].amount)} &nbsp; <sub>${formatMoney((countTrans / 100).toFixed(2))}</sub></td>
            <td>${capitilizeFirstLetter(myTransactions[i].type)}</td>
            <td data-gallary="${capitilizeFirstLetter(myTransactions[i].description)}">${capitilizeFirstLetter(getAnyById(myTransactions[i].category_id,categories).name)}</td>
            <td>${capitilizeFirstLetter(getAnyById(myTransactions[i].wallet_id,wallets).name)} &nbsp; <sub>${formatMoney((countWallet / 100).toFixed(2))}</sub></td>
            <td>
            <svg class="editTrans" data-id="${myTransactions[i].id}" data-type="edit" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
            <svg class="deleteTrans" data-id="${myTransactions[i].id}" data-type="delete" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            </td>
        </tr>` + transactionHTML;
    }
    
    tbody.innerHTML = transactionHTML

    var hidden =  localStorage.getItem('hidden')
    if(hidden === true || hidden === 'true'){
        querySelectorAllStyle(document.querySelectorAll('.tableCon sub'), { display: 'none' });
    }
}

function getAnyById(id,get){
    var gTransaction = get.find(getter => getter.id == id);
    return gTransaction
} 

function querySelectorAllStyle(selector, styleObj) {
            selector.forEach((el) => {
                Object.assign(el.style, styleObj);
            })
}

function displayVisible(word,item){
var hidd = localStorage.getItem(item)
if(hidd === true || hidd === 'true'){
    document.querySelector(`.${word}`).innerHTML = ' xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#b44c4c"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>'

}
else{
    document.querySelector(`.${word}`).innerHTML = 'xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#b44c4c"><path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"/>'
}
}

// #endregion





})