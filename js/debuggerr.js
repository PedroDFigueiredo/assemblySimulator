var debugStack = [];
var debugPcCounter = 0;
var dbgStackUpdateDiv = [];

function startUpDebuggerr(){
	ucp.MEMORY = [];
	buildTab2();

	var jow = startUpCompiler($('#codeText').val());
	binaryCode = jow[0];

	if(errorLog != ''){
		alert('There are errors to be solved');
		return;
	}


	$('#foward').attr('class', 'btn');
	$('#backwards').attr('class', 'btnDisabled');
	fwrdBool = true;
	backBool = false;
	
	buildTab2();
	pc =0;
	for (var i = 0; i<binaryCode.length; i+=32){
		ucp.setWord(binaryCode.slice(i,i+32), integerTo32Bits(i));
	}
	debugPcCounter = 0;
	debugMemory = [];
	debugStack = [];

	updateDivDebug(0);
	dbgStackUpdateDiv = [];
	dbgStackUpdateDiv.push(0);	
	updateAdress();
	console.log("step "+stepCounter);
	if(stepCounter != 0){
		startStepDebuggerr();
		return;
	}

}

function debugFoward(){
	console.log('foward');
	$('#backwards').attr('class', 'btn');
	backBool = true;
	var instruction = ucp.getWord(integerTo32Bits(pc*32));

	executeInstruction(instruction);
	updateRegistersValue();
	updateAdress();

	if(pc != binaryCode.length/32){ // if its not the end of the code
		updateDivDebug(pc);
		updatePastDiv();
		dbgStackUpdateDiv.push(pc);
		return true;
		console.log('end');
	}else{
		pc = dbgStackUpdateDiv[dbgStackUpdateDiv.length-1];
		dbgStackUpdateDiv.push(pc);
		$('#foward').attr('class', 'btnDisabled');
		fwrdBool = false;
		updatePastDiv();
		return false;
	}

}
function backwaards(){
	$('#foward').attr('class', 'btn');
	fwrdBool = true;
	var actualState = debugStack.pop();

	pc = actualState[0];

	if(actualState.length>1 ){
		if(actualState[1].indexOf('$')>=0){ // if the instruction change a register value not memory
			ucp.registers[registers.indexOf(actualState[1])].setData(actualState[2]);
		}else{
			ucp.setWord(actualState[2], actualState[1]); // set the value in the memory that was changeds
		}
	}
	updateRegistersValue();
	updateDivDebug(pc);
	updatePastDiv(pc);
	updateAdress();
	
	dbgStackUpdateDiv.pop();
	if(dbgStackUpdateDiv.length == 1){
		$('#backwards').attr('class', 'btnDisabled');
		backBool = false;
	}
}

function updateDivDebug(pos){
	var adressChild = document.getElementById('hexaAdress').childNodes; 
	var hexaChild = document.getElementById('hexaCode').childNodes; 
	var codeChild = document.getElementById('segmentCode').childNodes;
	
	adressChild[pos].setAttribute('class', 'debugtempDiv');
	hexaChild[pos].setAttribute('class', 'debugtempDiv');
	codeChild[pos].setAttribute('class', 'debugtempDiv');
}

function updatePastDiv(pos){
	var index = dbgStackUpdateDiv[dbgStackUpdateDiv.length-1];
	var css;

	if(pos == index)
		return;

	index%2==0 ? css = 'divpar' : css = 'divimpar';
	
	var adressChild = document.getElementById('hexaAdress').childNodes; 
	var hexaChild = document.getElementById('hexaCode').childNodes; 
	var codeChild = document.getElementById('segmentCode').childNodes;
	
	adressChild[index].setAttribute('class', css);
	hexaChild[index].setAttribute('class', css);
	codeChild[index].setAttribute('class', css);	
}

function buildTab2(){
	$("#tab1").hide();
    $("#tab2").show();
	$("#ta1li").css("margin-top",'0px');
	$("#ta2li").css("margin-top",'2px');

	$('#hexaAdress').replaceWith('<td id="hexaAdress" style="padding-right: 1px;" ></td>');
	$('#hexaCode').replaceWith('<td id="hexaCode" style="padding-right: 1px; padding-left: 1px;"></td>');
	$('#segmentCode').replaceWith('<td id="segmentCode" style="padding-right: 2px; padding-left: 1px;"></td>');

	var paridade;
	for (var i = 0, j=0; i < binaryCode.length; i+=32, j++) {
		var sliced = binaryCode.slice(i, i+32);
		var test = binaryToIntruction(sliced);
		j%2==0 ? paridade = 'divpar' :  paridade = 'divimpar'; 
		
		var bin = i.toString(16);
		var hex = binaryToHex(sliced).result;
		$('#hexaAdress').append('<div  class=\''+ paridade+'\'> 0x'+bin+'</div>');
		$('#hexaCode').append('<div class=\''+ paridade+'\'> 0x'+hex+'</div>');
		$('#segmentCode').append('<div class=\''+ paridade+'\'>'+test+'</div>');
	
	}	
}

function binaryToIntruction(code){
	var index = instructionsBin.indexOf(code.slice(0,6));
	var str ='';
	if(index == 0){
		index = instructionsFuncs.indexOf(code.slice(26, 32));
		if(index<11){
			str += instructions[index];
			str += ' '+registers[registersBin.indexOf(code.slice(16, 21))]+', '+registers[registersBin.indexOf(code.slice(6, 11))]+', '+registers[registersBin.indexOf(code.slice(11, 16))];
			return str;
		}else{
			str += instructions[index+18];
			str += ' '+registers[registersBin.indexOf(code.slice(6, 11))];
			return str;
		}
	}else if(index<19){ 
		str += instructions[index];
		str += ' '+registers[registersBin.indexOf(code.slice(11, 16))]+', '+registers[registersBin.indexOf(code.slice(6, 11))]+', '+twoComplementToInteger(code.slice(16, 32));
		return str;
	
	}else if(index<25){
		str += instructions[index];
		str += ' '+registers[registersBin.indexOf(code.slice(11, 16))]+', '+twoComplementToInteger(code.slice(16, 32))+'('+registers[registersBin.indexOf(code.slice(6, 11))]+')';
		return str;
	
	}else if(index<27){
		str += instructions[index];
		str += ' '+registers[registersBin.indexOf(code.slice(11, 16))]+', '+twoComplementToInteger(code.slice(16, 32));
		return str;
	
	}else if(index ==27){
		str += instructions[index];
		str += ' '+registers[registersBin.indexOf(code.slice(6, 11))];
		return str;
	}else{
		str += instructions[index];
		str += ' '+twoComplementToInteger(code.slice(6, 32));
		return str;
	}


}


//['add', 'sub', 'addu', 'subu', 'slt', 'sltu',  'and', 'nor', 'or', 'sll', 'srl',/**/  0-10
//'ori', 'andi', 'addi', 'addiu', 'slti', 'sltiu',  /**/ 11-16
//'beq', 'bne',  /**/' 17-18
//lw', 'sw', 'lb', 'lbu', 'lhu', 'sb',/**/  19-24
//'lui', 'li' 25-26
//'jr', 27
//'j', 'jal']; 28-29


function updateAdress(pos){
	for (var i = 0; i < 9; i++) {
		$("#adress"+i).replaceWith('<td id="adress'+i+'"></td>');
	}
	var base;
	if(pos == '' || pos == undefined)
		base = 0; 
	else 
		base = pos*2592;

	for (var i = 0; i < 9; i++) {
		i%2==0 ? paridade = 'divpar' :  paridade = 'divimpar';  
		var res = binaryToHex(integerTo32Bits((base + (i*(32*9))))).result;
		$("#adress0").append("<div  class=\'"+ paridade+"\'>0x"+ res +"</div>");
	}

	var paridade;
	for (var i = 1; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			j%2==0 ? paridade = 'divpar' :  paridade = 'divimpar';  
			$("#adress"+i).append("<div  class=\'"+ paridade+"\'>0x"+ binaryToHex(ucp.getWord(integerTo32Bits((base+((i-1)*32))+(j*256)))).result+"</div>");
		}	
	}
}

function incresseAdres(val){
	$('#adressPosition').val('0x'+binaryToHex(integerTo32Bits(parseInt(val)+1)).result);
	updateAdress(parseInt(val)+1);
}

function decresseAdres(val){
	if(val.replace('0x','') != 0){
		$('#adressPosition').val('0x'+binaryToHex(integerTo32Bits(parseInt(val)-1)).result);
	}
	var aux;

	val == 0 ? aux=0 : aux = val-1; 
	updateAdress(aux);
}

var stepTimer, stepTimerInterval = 0;
var stepCounter = 0;
function startStepDebuggerr(){
    clearTimeout(typingTimer);
    //console.log('entrou debugStep');
    //console.log(pc +'----'+binaryCode.length/32+'----'+(pc != binaryCode.length/32));		
   // while(pc != binaryCode.length/32){
   	console.log(stepCounter+'---- stepcou ter');
   	stepTimerInterval = stepCounter*350;
   	contadorDeMerda = 0;
	inferno = true;
	console.log('aqui '+stepTimerInterval);
   	test1();
}

function test1(){
	if(inferno == false)
		return
	console.log(contadorDeMerda+'---test1--'+pc);
	clearTimeout(stepTimer);
	stepTimer = setTimeout(test2, stepTimerInterval);
}
function test2(){
	console.log(contadorDeMerda+'--test2--'+pc+'---'+binaryCode.length/32);
	contadorDeMerda++;
	console.log('infe '+inferno);
	if(inferno != false){
		inferno = debugFoward();
		test1();
	}
}

function binaryToHex(s) {
    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                return { valid: false };
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                return { valid: false };
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    return { valid: true, result: ret };
}
