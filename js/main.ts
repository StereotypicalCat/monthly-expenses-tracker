interface subscription{
  title: String,
  price: number,
  currency: String,
  months: number,
  notes: String,
  monthly: number,
  indkk: number,
  percentOfWhole: number,
  changed: boolean
}

interface oldSubscription{
  title: String,
  amount: number,
  currency: String,
  months: number,
  notes: String,
  monthly: number,
  indkk: number,
  percentOfWhole: number,
  changed: boolean
}

interface oldSave{
  subscriptions: oldSubscription[],
  keys: string[], //Currencies symbols
  values: number[] // Currencies values
}

interface save{
  version: number,
  subscriptions: subscription[],
  keys: String[], //Currencies symbols
  values: number[] // Currencies values
}

// Setup
let subscriptions: subscription[] = [];

const currencies:Map<String, number> = new Map()
currencies.set("$", 6.78)
currencies.set("€", 7.47)
currencies.set("DKK", 1)

// The name of the data in localStorage
const localDataName = "subscriptionInformation"
let localSortPreferenceName = "sortPreference"

// Initial scroll distance to bottom of the page.
let scrollDistance = getDocHeight()

// Function that top/bottom button calls. Scrolls to top if user has scrolled 50% down, bottom otherwise.
let scrollToTopOrBottom = () => {
  window.scrollTo({
    top: scrollDistance,
    left: 0,
    behavior: 'smooth'
  })
}

// Gets the height of the page.
function getDocHeight() {
  let D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  )
}

// Keep track of the window height.
let winheight = window.innerHeight || (document.documentElement || document.body).clientHeight;
window.onresize = () => {
  winheight = window.innerHeight || (document.documentElement || document.body).clientHeight;
}

// Returns true if valid subscription, false if not.
let isValidNewSubscription = (subscription): Boolean => {

  // Title of subscription must be unique.
  if (subscriptions.map((sub) => sub.title).includes(subscription.title)) {
    alert("Subscription name not unique")
    return false
  }

  return isValidSubscription(subscription);
}

let isValidSubscription = (subscription: subscription): boolean => {
  if (isNaN(subscription.price)) {
    alert("Amount is not a number")
    return false
  }
  if (!([...currencies.keys()].includes(subscription.currency))) {
    alert("Currency is not a valid currency")
    return false
  }
  if (isNaN(subscription.months)) {
    alert("Months are not a number")
    return false
  }

  return true
}

let createNewSubscription = (title, price, currency, months, notes): subscription => {
  const newSub: subscription = {
    changed: false,
    currency: currency,
    indkk: 0,
    monthly: 0,
    months: months,
    notes: notes,
    percentOfWhole: null,
    price: price,
    title: title
  }

  newSub.monthly = newSub.price / newSub.months;
  newSub.indkk = newSub.monthly * currencies.get(newSub.currency);

  return newSub;
}

// Create a new subscription
let newSubscription = () => {
  // Open the popup
  // @ts-ignore
  Swal.fire({
    title: 'Insert subscription information',
    html:
      '<hr class="is-black">' +
      '<label class="label has-text-left">Title</label> ' +
      '<input id="swal-input1" class="swal2-input" placeholder="Subscription title" value="">' +
      '<label class="label has-text-left">Amount</label> ' +
      '<input id="swal-input2" class="swal2-input" placeholder="Original Amount" value="">' +
      '<label class="label has-text-left">Currency</label> ' +
      '<input id="swal-input3" class="swal2-input" placeholder="Original Currency" value="">' +
      '<label class="label has-text-left">Over how many months</label> ' +
      '<input id="swal-input4" class="swal2-input" placeholder="Over how many months" value="">' +
      '<label class="label has-text-left">Other notes</label> ' +
      '<textarea id="swal-input5" class="textarea" placeholder="Notes" rows="4" cols="4">' + '</textarea>',
    focusConfirm: false,
    preConfirm: () => {
      // Create a new temporary subscription


      const title = (<HTMLInputElement>document.getElementById('swal-input1')).value;
        const price = parseFloat((<HTMLInputElement>document.getElementById('swal-input2')).value)
      const  currency = (<HTMLInputElement>document.getElementById('swal-input3')).value
        const months = parseInt((<HTMLInputElement>document.getElementById('swal-input4')).value)
      const notes = (<HTMLInputElement>document.getElementById('swal-input5')).value

      const newSub = createNewSubscription(title, price, currency, months, notes)

      // Do some form validation
      let valid = isValidNewSubscription(newSub)

      // Update the table if form was validated successfully
      if (valid){
        subscriptions.push(newSub)
        updateTable()
      }
    }
  })
}

// Edit a subscription
let editSubscription = (btn) => {
  // Find out which subscription we're editing
  let currentSubscription = getSubscriptionFromButton(btn)

  // Open the popup, and fill in the current subscription information in the form
  // @ts-ignore
  Swal.fire({
    title: 'Insert subscription information',
    html:
      '<hr class="is-black">' +
      '<label class="label has-text-left">Title</label> ' +
      '<input id="swal-input1" class="swal2-input" placeholder="Subscription title" value="' + currentSubscription.title + '">' +
      '<label class="label has-text-left">Amount</label> ' +
      '<input id="swal-input2" class="swal2-input" placeholder="Original Amount" value="' + currentSubscription.price + '">' +
      '<label class="label has-text-left">Currency</label> ' +
      '<input id="swal-input3" class="swal2-input" placeholder="Original Currency" value="' + currentSubscription.currency + '">' +
      '<label class="label has-text-left">Over how many months</label> ' +
      '<input id="swal-input4" class="swal2-input" placeholder="Over how many months" value="' + currentSubscription.months + '">' +
      '<label class="label has-text-left">Other notes</label> ' +
      '<textarea id="swal-input5" class="textarea" placeholder="Notes" rows="4" cols="4">' + currentSubscription.notes + '</textarea>',
    focusConfirm: false,
    cancelButtonColor: '#d33',
    showCancelButton: true,
    preConfirm: () => {
      // Create a new temporary subscription
      const title = (<HTMLInputElement>document.getElementById('swal-input1')).value;
      const price = parseFloat((<HTMLInputElement>document.getElementById('swal-input2')).value)
      const currency = (<HTMLInputElement>document.getElementById('swal-input3')).value
      const months = parseInt((<HTMLInputElement>document.getElementById('swal-input4')).value)
      const notes = (<HTMLInputElement>document.getElementById('swal-input5')).value

      const editedSub = createNewSubscription(title, price, currency, months, notes)

      let valid: boolean = isValidSubscription(editedSub)
      console.log(valid)

      if (valid){
        console.log(editedSub)
        // Update the table if form was validated successfully
        deleteSubscription(currentSubscription)
        subscriptions.push(editedSub)
        updateTable()
      }
    }
  })
}

// Add a new currency. Called by the add currency button
let addCurrency = () => {
  // Fire popup
  // @ts-ignore
  Swal.fire({
    title: 'Insert currency information',
    html:
      '<input id="swal-input1" class="swal2-input" placeholder="Currency Symbol">' +
      '<input id="swal-input2" class="swal2-input" placeholder="DKK Rate">',
    focusConfirm: false,
    preConfirm: () => {
      // Register the new possible currency
      let newCurrency = {
        symbol: (<HTMLInputElement>document.getElementById('swal-input1')).value,
        rate: parseFloat((<HTMLInputElement>document.getElementById('swal-input2')).value),
      }

      // Check that the rate is a number
      if (isNaN(newCurrency.rate)) {
        alert("DKK exchange rate is not a number")
        return
      }

      // Update with the new currency, and refresh the table
      currencies.set(newCurrency.symbol, newCurrency.rate)
      updateTable()
    }
  })
}

// Delete all subscriptions.
let Reset = () => {
  // @ts-ignore
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.value) {
      subscriptions.length = 0;
      updateTable()
      // @ts-ignore
      Swal.fire(
        'Reset!',
        'Your subscriptions have been reset.',
        'success'
      )
    }
  })
}


// Method for updating the table with new information.
let updateTable = () => {
  // Create a new replacement tbody
  let newTbody = document.createElement('tbody');
  newTbody.classList.add("tbody")

  // Sort by users preference

  // Add rows from data in memory.
  populateTable(newTbody)

  // Replace the old tbody with the new cleared one
  let oldTbody = document.querySelector('.tbody')
  oldTbody.parentNode.replaceChild(newTbody, oldTbody)

  // Save the new information locally.
  setStored(localDataName, JSON.stringify(getSaveInfo()))
}

// Populate a tbody with subscriptions from the subscriptions array.
let populateTable = (tbody) => {
  // Store the total cost of all subscriptions
  if (subscriptions.length <= 0){
    return;
  }
  let total = subscriptions.map((s) => s.indkk).reduce((acc, sub) => acc + sub)

  // Update tablefoot with total monthly cost and amount of subscriptions.
  document.querySelector('#total').innerHTML = total.toFixed(2);
  document.querySelector('#amountOfSubscriptions').innerHTML = subscriptions.length.toString();

  // Begin to create table rows
  for (let i = 0; i < subscriptions.length; i++) {
    // Select a subscription on index i, and create a new empty row
    let elem = subscriptions[i]
    let tr = document.createElement('tr');

    // Calculate the subscriptions percentage-wise cost of the monthly total.
    elem.percentOfWhole = elem.indkk / total * 100;

    // If this element has been changed (ie. created, moved), mark it for the user.
    if (elem.changed) {
      tr.classList.add("is-selected");
      elem.changed = false
    }

    // Create the row.
    tr.innerHTML = '<td>' + elem.title + '</td>' +
      '<td>' + elem.monthly.toFixed(2) + '</td>' +
      '<td>' + elem.currency + '</td>' +
      '<td>' + elem.indkk.toFixed(2) + '</td>' +
      '<td>' + elem.percentOfWhole.toFixed(2) + '%</td>' +
      '<td>' + '<button class="button" onclick="getInfoOfSubscription(this)">Info</button>' + '</td>' +
      '<td>' + '<button class="button" onclick="askToDeleteRow(this)">Delete</button>' + '</td>' +
      '<td>' + `<button class="button" onclick="editSubscription(this)">Edit</button>` + '</td>';

    // Append the new row
    tbody.appendChild(tr);
  }
}

// Create a pie-chart with the cost of each subscription
let PieChart = () => {
  // Get data ready for CanvasJS.
  let data = []
  for (let subscription of subscriptions) {
    console.log(subscription)
    data.push({y: subscription.percentOfWhole, label: subscription.title})
  }

  // Create the chart with CanvasJS.
  // @ts-ignore
  let chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    title: {
      text: "Monthly Expenses"
    },
    data: [{
      type: "pie",
      startAngle: 240,
      yValueFormatString: "##0.00\"%\"",
      indexLabel: "{label} {y}",
      dataPoints: data
    }]
  });

  // Lastly, render it.
  chart.render()
}

// Ask the user what to sort by, and then sorts the array.
let Sort = async () => {

  // The input options for SWAL2
  const inputOptions = new Promise((resolve) => {
    resolve({
      'Lex': 'Lexi.',
      'Price': 'Price'
    })
  })

  // Fire the popup
  // @ts-ignore
  const {value: sortBy} = await Swal.fire({
    title: 'Sort by what',
    input: 'radio',
    inputOptions: inputOptions,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to choose something!'
      }
    }
  })

  // Sort the array, and save the sorting preference
  if (sortBy) {
    if (sortBy == "Lex") {
      setStored(localSortPreferenceName, "Lex")
      sortSubscriptionsByName()
      updateTable()
    } else if (sortBy == "Price") {
      setStored(localSortPreferenceName, "Price")
      sortSubscriptionsByPrice()
      updateTable()
    }
  }
}

// different sorters for subscriptions array
let sortSubscriptionsByPrice = () => {
  subscriptions.sort((a, b) => {
    if (a.indkk > b.indkk) {
      return -1;
    }
    if (b.indkk > a.indkk) {
      return 1;
    }
    return 0;
  })
}
let sortSubscriptionsByName = () => {
  subscriptions.sort((a, b) => {
    if (a.title > b.title) {
      return 1;
    }
    if (b.title > a.title) {
      return -1;
    }
    return 0;
  })
}


// Gets more information on a subscription, and displays it in a popup
let getInfoOfSubscription = (btn) => {
  let currentSub = getSubscriptionFromButton(btn)
  // @ts-ignore
  Swal.fire(
    currentSub.title,
    `${currentSub.price}${currentSub.currency} over ${currentSub.months} months, which equates to <br>
     ${currentSub.monthly}${currentSub.currency} monthly, or about ${currentSub.indkk} DKK <br> ` +
    // Display notes only if there are some.
    (currentSub.notes === undefined ? "" : (
      `
     Notes: <br>
    <div class="control">
        <textarea class="textarea" disabled>${currentSub.notes}</textarea>
    </div>
    `)),
    'question'
  )
}

// Since title is unique, this finds the title of the row from which a button was pressed, and returns that subscription from the subscription array
let getSubscriptionFromButton = (button) => {
  let tr = button.parentNode.parentNode
  let title = tr.firstChild.textContent
  return subscriptions.filter(s => s.title == title)[0]
}

let askToDeleteRow = (btn) => {
  // @ts-ignore
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.value) {
      deleteSubscription(getSubscriptionFromButton(btn))
      // @ts-ignore
      Swal.fire(
        'Deleted!',
        'Your file has been deleted.',
        'success'
      )
    }
  })
}

let deleteSubscription = (subscription) => {
  const index = subscriptions.map(s => s.title).indexOf(subscription.title);
  subscriptions.splice(index, 1);
  updateTable()
}

// Make subscriptions and currency ready to be stored as JSON
let getSaveInfo = (): save => {
  return {version: 1, subscriptions: subscriptions, keys: [...currencies.keys()], values: [...currencies.values()]}
}

// Parse a save object, and use it as the current info.
let loadSaveInfo = (loadedSave: save, oldLoadedSave: oldSave) => {

  let actualSaveToUse = loadedSave;

  if (oldLoadedSave !== null){
    // Old data

    console.log("loading legacy data...")

    const oldData: oldSave = oldLoadedSave;

    let newData: save = {keys: [], subscriptions: [], values: [], version: 0};
    newData.keys = oldData.keys;
    newData.version = 1;
    newData.values = oldData.values;

    for (let sub of oldLoadedSave.subscriptions){
      const newSub: subscription = createNewSubscription(sub.title, sub.amount, sub.currency, sub.months, sub.notes);
      newData.subscriptions.push(newSub);
    }

    actualSaveToUse = newData;
  }


  subscriptions = actualSaveToUse.subscriptions

  currencies.clear()
  for (let i = 0; i < actualSaveToUse.keys.length; i++) {
    currencies.set(actualSaveToUse.keys[i], actualSaveToUse.values[i])
  }
}

// Save a local JSON version of the current state.
let saveToFile = () => {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getSaveInfo()));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "save" + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Load a local JSON version of some state.
let load = () => {
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  } else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  } else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  } else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }

  function receivedText(e) {
    let lines = e.target.result;
    let loadedSave = JSON.parse(lines);

    if (loadedSave.version == null){
      loadSaveInfo(null, loadedSave)
    }
    else{
      loadSaveInfo(loadedSave, null)

    }

    updateTable()
  }
}

// Retrieve the key value pair vname, vvalue
function getStored(vname) {
  if (typeof (Storage) !== "undefined") {
    return localStorage.getItem(vname)
  } else {
    return getCookie(vname)
  }
}

// Store the key value pair vname, vvalue
function setStored(vname, vvalue) {
  if (typeof (Storage) !== "undefined") {
    return localStorage.setItem(vname, vvalue)
  } else {
    return setCookie(vname, vvalue, 1000)
  }
}


// Fallback if browser doesn't support HTML5 localstorage
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


// Try to load data from local storage. If this fails, there's probably not any data to retrieve.
try {
  let data = JSON.parse(getStored(localDataName));

  if (data.version == null){
    loadSaveInfo(null, data);
  }
  else{
    loadSaveInfo(data, null)
  }

  // Find out if we want to sort the array of the users data.
    let userSortPref = getStored(localSortPreferenceName)
    if (userSortPref === undefined){
      sortSubscriptionsByName()
    }
    else{
      if (userSortPref == "Price"){
        sortSubscriptionsByPrice()
      }
      else{
        sortSubscriptionsByName()
      }
    }
  updateTable()
} catch (e) {
  console.log("Didn't find any locally stored data")
  console.log(e)
}
