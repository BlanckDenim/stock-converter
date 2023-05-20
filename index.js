// User define file
let userFile_BWD = []; // F = SKU, I = Quantity (Read)
let userFile_BMD = []; // F = SKU, I = Quantity (Read)
let sample = []; // I = SKU, P = Available (Write)

// Reading sample file
fetch('/stock-converter/sample.csv').then(
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
                    if(userfileRow["SKU"] == row[8] && userfileRow["QTY"] != row[17]){
                        try{
                            parseInt(userfileRow["QTY"]);
                            parseInt(sample[i][17]);

                            console.log(userfileRow["SKU"] + " " + userfileRow["QTY"] + " ===>  " + row[8] + " " + row[17])
                            sample[i][17] = userfileRow["QTY"]
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
    csvText = buildText(sample)
    console.log(csvText)
    let csvBlob = new Blob([buildText(sample)], {type: 'text/plain;charset=utf-8'})
    // let file = new File([csvBlob], "stock_convert.csv")
    
    let btnDownload = document.querySelector("#btnDownload")
    let blobURL = URL.createObjectURL(csvBlob)
    btnDownload.setAttribute('href', blobURL);

    // filename
    let date = new Date();
    let dateStr = date.getDate() + "_" + date.getMonth() + "_" + date.getFullYear()
    btnDownload.setAttribute('download', 'stock_converter_' + dateStr + '.csv');

    btnDownload.click();
    URL.revokeObjectURL(blobURL);
    console.log("Trying to download")
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