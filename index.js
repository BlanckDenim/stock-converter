// User define file
//let userFile_BWD = []; // F = SKU, I = Quantity (Read)
//let userFile_BMD = []; // F = SKU, I = Quantity (Read)
let sheets = [];
let sample = []; // I = SKU, P = Available (Write)
let unicommerce = [["Product Code*","Quantity*","Shelf Code*","Adjustment Type*","Inventory Type","Transfer to Shelf Code","Sla","Source Batch Code","Remarks","Force Allocate"]]

// Hash map
let skuPairs = {}

// User uploaded excel file
let workbook = null

// Reading sample file
fetch( window.location.href + 'data/new_sample.csv').then(
    res => res.blob()
).then(
    blob => blob.text()
).then(data => {
    sample = buildCSV(data)
    console.log(sample)
})

// Build csv file from text format
function buildCSV(text){
    let result = []

    //Building data
    let row = []
    let lines = text.split("\n");
    lines.forEach(line => {
        row = []
        cells = line.split(",")
        cells.forEach(value => {
            row.push(value);
        })

        result.push(row)
    });

    return result;
}

function buildText(csv){
    let result = ""

    //Building text
    csv.forEach(row => {
        row.forEach(cell => {
            result += cell + ","
        })

        result += "\n"
    })

    return result
}

// Simulate file input field when clicked on button
function openFile(){
    document.querySelector("#btnFile").click()
}

function buildHashMap(){

    workbook.SheetNames.forEach((sheet, i) => {
        let currentSheet = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet])

        try{
            currentSheet.forEach((row,i) => {
                skuPairs[row["SKU"]] = parseInt(row["QTY"])
            })
        }
        catch(e){
            alert("There is something wrong with your excel file : " + e);
        }
    })
}

function startConvert(){

    // Update the stock
    // row[8] --> SKU
    // row[17] --> On hand
    try{
        sample.forEach((row,i) => {
            if(skuPairs[row[8]] != undefined){
                if(skuPairs[row[8]] != parseInt(row[17])){
                    console.log(`Updated ${row[8]} from ${row[17]} to ${skuPairs[row[8]]}`)
                    row[16] = skuPairs[row[8]]
                    row[17] = skuPairs[row[8]]
                }
            }
        })
    }catch(e){
        alert("Given sample is invalid : " + e);
    }
}

function startConvertUni(){
    let skuKeys = Object.keys(skuPairs)
    let skuValue = Object.values(skuPairs)

    for(let i = 0; i < skuKeys.length; i++){
        let uni_row = [skuKeys[i], skuValue[i],"DEFAULT","REPLACE","","","","","",""]
        unicommerce.push(uni_row)
    }
}

function downloadFile(){
    // Convert array to csv file
    // Building CSV for shopify
    let csvBlob = new Blob([buildText(sample)], {type: 'text/plain;charset=utf-8'})
    let btnDownload = document.querySelector("#btnDownload")
    let blobURL = URL.createObjectURL(csvBlob)
    btnDownload.setAttribute('href', blobURL);
    
    // Building csv file for unicommerce
    let csbBlobUni = new Blob([buildText(unicommerce)], {type: 'text/plain;charset=utf-8'})
    let btnDownloadUni = document.querySelector("#btnDownloadUnicommerce")
    let blobURLUni = URL.createObjectURL(csbBlobUni)
    btnDownloadUni.setAttribute('href', blobURLUni)

    // filename
    let date = new Date();
    let dateStr = date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear()
    btnDownload.setAttribute('download', 'shopify_stock_' + dateStr + '.csv');
    btnDownloadUni.setAttribute('download', 'unicommerce_stock_' + dateStr + '.csv');

    btnDownload.click();
    btnDownloadUni.click();

    //Cleaning up
    URL.revokeObjectURL(blobURL);
    URL.revokeObjectURL(blobURLUni);

}


// Read xlsx file from the user
function readFile(e){
    let file = e.target.files[0];
    if(!file){
        return;
    }

    let reader = new FileReader();
    reader.onload = function(e){
        let content = e.target.result;

        // Build user file
        workbook = XLSX.read(content, {
            type: 'binary'
        });

        console.log(workbook.SheetNames.length);

        // Build hash map for optimization
        buildHashMap();

        // Start conversion
        startConvert();
        startConvertUni();

        // Give file to the user
        downloadFile();
    }

    reader.readAsBinaryString(file);
}

document.querySelector("#btnFile").addEventListener('change', readFile, false);