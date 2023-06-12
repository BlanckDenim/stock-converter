// User define file
let userFile_BWD = []; // F = SKU, I = Quantity (Read)
let userFile_BMD = []; // F = SKU, I = Quantity (Read)
let sample = []; // I = SKU, P = Available (Write)
let unicommerce = [["Product Code*","Quantity*","Shelf Code*","Adjustment Type*","Inventory Type","Transfer to Shelf Code","Sla","Source Batch Code","Remarks","Force Allocate"]]

// Reading sample file
fetch('/sample.csv').then(
    res => res.blob()
).then(blob => 
    blob.text()
).then(data => {
    sample = buildCSV(data)
    console.log(sample);
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

function startConvert(){

    // Update the stock
    sample.forEach((row,i) => {
        let currentSheet = 0;

        try{
            if(row[8].split("-")[0] == "BWD"){
                currentSheet = userFile_BWD
            }
            if(row[8].split("-")[0] == "BMD"){
                currentSheet = userFile_BMD
            }

            //Search sheets
            if(currentSheet != 0){
                currentSheet.forEach(userfileRow => {
                    if(userfileRow["SKU"] == row[8]){
                        try{
                            parseInt(userfileRow["QTY"]);
                            parseInt(sample[i][17]);

                            console.log(userfileRow["SKU"] + " " + userfileRow["QTY"] + " ===>  " + row[8] + " " + row[17])
                            sample[i][17] = userfileRow["QTY"]

                            // Adding to unicommerce as well
                            let uni_row = [userfileRow["SKU"],sample[i][17],"DEFAULT","REPLACE","","","","","",""]
                            unicommerce.push(uni_row)
                        }catch{
                            alert("Provided excel sheet format is invalid");
                        }
                    }
                })
            }
        }catch(e){
            console.log("error in conversion: " + e)
        }
    })

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
    var file = e.target.files[0];
    if(!file){
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e){
        var content = e.target.result;

        // Build user file
        //userFile = buildCSV(content);
        var workbook = XLSX.read(content, {
            type: 'binary'
        });

        userFile_BWD = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["BWD"])
        userFile_BMD = XLSX.utils.sheet_to_row_object_array(workbook.Sheets["BMD"])

        // Start conversion
        startConvert();
    }

    reader.readAsBinaryString(file);
}

document.querySelector("#btnFile").addEventListener('change', readFile, false);