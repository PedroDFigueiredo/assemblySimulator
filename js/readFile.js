function handleFileSelect(){
  $('#fileChooser').trigger('click');
  console.log('entrou');
}
function delegateFileSelect()
{               
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
    }   

    input = document.getElementById('fileChooser');
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
   }
   else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
   }
   else if (!input.files[0]) {
      alert("Please select a file before clicking 'Load'");               
   }
   else {
      file = input.files[0];
      fr = new FileReader();
      fr.onload = receivedText;
      fr.readAsText(file);
      //fr.readAsDataURL(file);
	     receivedText();
   }
}

function receivedText() {           
	var  result = fr.result;
	$('#codeText').val(result);
  startUpCompiler($('#codeText').val());
  $('#errorlog').val(errorLog);
}


