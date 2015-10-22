var linesCount=1;
var zero = '00000000000000000000000000000000';
var debugPcCounter = 0;


function startUpExecutor(){
	pc = 0;
	ucp.MEMORY = [];
	for (var i = 0; i<binaryCode.length; i+=32){
		ucp.setWord(binaryCode.slice(i,i+32), integerTo32Bits(i));
	}
	
	var count = binaryCode.length/32;
	pc = 0;
	dbgStackUpdateDiv.push(pc);	//push to debug stack the actual pc 
	while(pc < count){
//		printMemo();

		var instruction = ucp.getWord(integerTo32Bits(pc*32));
		
		executeInstruction(instruction);

		if(pc != binaryCode.length/32)
			dbgStackUpdateDiv.push(pc);	

		updateRegistersValue();

	}
	dbgStackUpdateDiv.push(pc-1);//add one more pc to restast the countdown at the end of debug
	$('#backwards').attr('class', 'btn');
	$('#foward').attr('class', 'btnDisabled');
	backBool = true;
	fwrdBool = false;
	updateAdress();
}

function printMemo(){
	var str =''
				for (var i = 0; i < ucp.MEMORY.length; i++) {
					i%32 == 0 ? str += '\n'+binaryCode[i]: str+= binaryCode[i];
				}
				console.log(str);

}

function pcPlusFour(next){ // if the parameter its defined, meas that the function is an jump
	next == undefined ? pc++ : pc = pc +1+ twoComplementToInteger(next);
}

function executeInstruction(code){
	var opcode = code.slice(0, 6);
	var index = instructionsBin.indexOf(opcode);
	console.log(index+'--index--'+instructions[index]+'---op--'+opcode);
	if(opcode == 0){ //type R
		var temp = code.slice(26, 32);
		index = instructionsFuncs.indexOf(code.slice(26, 32));
		if(index > 10){//in case of jr 
			index += 15;
			typeI(code, index);
		}else if(index > 8){
			shifter(code, index);
		}else 
			typeR(code, index);

	}else if(index == 28){
		typeJ(code, index);	
	}else{
		typeI(code, index);
	}
}

function typeR(code, index){
	var rs = registersBin.indexOf(code.slice(6, 11));
	var rt = registersBin.indexOf(code.slice(11, 16));
	var rd = registersBin.indexOf(code.slice(16, 21));
	ula.functions[index](ucp.registers[rd], ucp.registers[rt], ucp.registers[rs]);
}

function shifter(code, index){
	var h = (code.slice(21, 26));
	var rt = registersBin.indexOf(code.slice(11, 16));
	var rd = registersBin.indexOf(code.slice(16, 21));
	ula.functions[index](ucp.registers[rd], ucp.registers[rt], h);
}

function typeI(code, index){
	var h = (code.slice(16, 32));
	var rt = registersBin.indexOf(code.slice(6, 11));
	var rd = registersBin.indexOf(code.slice(11, 16));
	ula.functions[index](ucp.registers[rd], ucp.registers[rt], h);
}

function typeJ(code, index){
	ula.functions[index]('0', '0', code.slice(8,32));
}
function ULA(){
	this.functions = [
					 function(rd, rt, rs){ 		add(rd, rt, rs)},
					 function(rd, rt, rs){		sub(rd, rt, rs)},
					 function(rd, rt, rs){		addu(rd, rt, rs)},
					 function(rd, rt, rs){		subu(rd, rt, rs)},
					 function(rd, rt, rs){		slt(rd, rt, rs)},
					 function(rd, rt, rs){		sltu(rd, rt, rs)},
					 function(rd, rt, rs){ 		and(rd, rt, rs)},
					 function(rd, rt, rs){ 		nor(rd, rt, rs)},
					 function(rd, rt, rs){ 		or(rd, rt, rs)},
					 function(rd, rt, h){ 		sll(rd, rt, h)},
			 		 function(rd, rt, h){ 		srl(rd, rt, h)},
					 function(rd, rt, value){	ori(rd, rt, value)},
					 function(rd, rt, value){	andi(rd, rt, value)},
					 function(rd, rt, value){	addi(rd, rt, value)},
 					 function(rd, rt, value){	addiu(rd, rt, value)},
					 function(rd, rt, value){	slti(rd, rt, value)},
			 		 function(rd, rt, value){	sltiu(rd, rt, value)},
			 		 function(rd, rt, label){	beq(rd, rt, label)},
			 		 function(rd, rt, label){	bne(rd, rt, label)},
			 		 function(rd, rt, value){	lw(rd, rt, value)},
			 		 function(rd, rt, value){	sw(rd, rt, value)},
			 		 function(rd, rt, value){	lb(rd, rt, value)},
			 		 function(rd, rt, value){	lbu(rd, rt, value)},
			 		 function(rd, rt, value){	lhu(rd, rt, value)},
			 		 function(rd, rt, value){	sb(rd, rt, value)},
					 function(rd, rt, value){	lui(rd, rt, value)},
					 function(rd, rt, value){	addiu(rd, rt, value)},
					 function(rd, rt, value){	jr(rd, rt, value)},
					 function(rd, rt, value){	j(rd, rt, value)},
					 function(rd, rt, value){	jal(rd, rt, value)}
					 ]
}

//0
function add(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(integerToComplemet32bits(twoComplementToInteger(rs.getData()) + twoComplementToInteger(rt.getData())));
	pcPlusFour();
}
//1
function sub(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(integerToComplemet32bits(twoComplementToInteger(rs.getData()) - twoComplementToInteger(rt.getData())));
	pcPlusFour();
}
//2
function addu(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(integerTo32Bits(parseInt(rs.getData(), 2) + parseInt(rt.getData(), 2)));
	pcPlusFour();
}
//3
function subu(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(integerTo32Bits(parseInt(rs.getData(), 2) - parseInt(rt.getData(), 2)));
	pcPlusFour();
}
//4
function slt(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	if(twoComplementToInteger(rs.getData()) < twoComplementToInteger(rt.getData()))
		rd.setData(integerTo32Bits(1));
	else
		rd.setData(zero);
	pcPlusFour();
}
//5
function sltu(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	if(integerTo32Bits(rs.getData()) < integerTo32Bits(rt.getData()))
		rd.setData(integerTo32Bits(1));
	else
		rd.setData(zero);
	pcPlusFour();
}
//6
function and(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var and='';
	var t = rt.getData();
	var s = rs.getData();
	for (var i = 0; i < 32; i++) {
		t[i] == s[i] ? and += '1' : and += '0'; 			
	}
	rd.setData(and);
	pcPlusFour();
}
//7
function nor(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var or='';
	var t = rt.getData();
	var s = rs.getData();
	for (var i = 0; i < 32; i++) {
		!(t[i] == '1' || s[i] == '1') ? or += '1' : or += '0'; 			
	}
	rd.setData(or);
	pcPlusFour();
}
//8
function or(rd, rt, rs){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var or='';
	var t = rt.getData();
	var s = rs.getData();
	for (var i = 0; i < 32; i++) {
		(t[i] == '1' || s[i] == '1') ? or += '1' : or += '0'; 			
	}
	rd.setData(or);
	pcPlusFour();
}
//9
function sll(rd, rt, h){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var shifted = rt.getData();
	var shift = parseInt(h,2);
	for (var i = 0; i < shift; i++) {
		shifted += '0';
	}
	rd.setData(shifted.slice(shift, shifted.length));
	pcPlusFour();
}
//10
function srl(rd, rt, h){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var shifted = '';
	var shift = parseInt(h,2);
	for (var i = 0; i < shift; i++) {
		shifted += '0';
	}

	shifted += rt.getData();
	rd.setData(shifted.slice(0, 32));
	pcPlusFour();
}
//11
function ori(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var t = rt.getData();
	var or= t.slice(0,16);
	for (var i = 16; i < 32; i++) {
		t[i] == '1' || value[i-16] == '1' ? or += '1' : or += '0';
	}
	rd.setData(or);
	pcPlusFour();

}
//12
function andi(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var t = rt.getData();
	var and= '0000000000000000';
	for (var i = 16; i < 32; i++) {
		t[i] == '1' && value[i-16] == '1' ? and += '1' : and += '0';
	}
	rd.setData(and);
	pcPlusFour();

}
//13
function addi(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(integerToComplemet32bits(twoComplementToInteger(rt.getData()) + twoComplementToInteger(value)));
	pcPlusFour();
}
//14
function addiu(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(integerToComplemet32bits(twoComplementToInteger(rt.getData()) + twoComplementToInteger(value)));
	pcPlusFour();
}
//15
function slti(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	twoComplementToInteger(rt.getData()) < twoComplementToInteger(value) ? rd.setData(integerToComplemet32bits(1)) : rd.setData(zero);
	pcPlusFour();
}
//16
function sltiu(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	twoComplementToInteger(rt.getData()) < twoComplementToInteger(value) ? rd.setData(integerToComplemet32bits(1)) : rd.setData(zero);
	pcPlusFour();
}
//17
function beq(rd, rt, label){
	debugStack.push([pc]);
	if(rd.getData() == rt.getData())
		pcPlusFour(label);
	else
		pcPlusFour();
}
//18
function bne(rd, rt, label){
	debugStack.push([pc]);
	if(rd.getData() != rt.getData())
		pcPlusFour(label);
	else
		pcPlusFour();
}
//19
function lw(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(ucp.getWord(integerTo32Bits(twoComplementToInteger(value)*8 + parseInt(rt.getData(),2))));
	pcPlusFour();
}
//20
function sw(rd, rt, value){
	var index = integerTo32Bits(twoComplementToInteger(value)*8 + (parseInt(rt.getData(),2)*8));
	debugStack.push([pc, index, ucp.getWord(index)]);
	ucp.setWord(rd.getData(), index);
	pcPlusFour();
}
//21
function lb(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(ucp.getByte(integerTo32Bits(twoComplementToInteger(value)*8 + parseInt(rt.getData(),2))));
	pcPlusFour();
}
//22
function lbu(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(ucp.getByte(integerTo32Bits(twoComplementToInteger(value)*8 + parseInt(rt.getData(),2))));
	pcPlusFour();
}
//23
function lhu(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	var halfWord =  ucp.getWord(integerTo32Bits(twoComplementToInteger(value)*8 + parseInt(rt.getData(),2))).slice(16, 32);
	rd.setData('0000000000000000' +halfWord);
	pcPlusFour();
}
//24
function sb(rd, rt, value){
	var index = integerTo32Bits(twoComplementToInteger(value)*8 + parseInt(rt.getData(),2));
	debugStack.push([pc, index, ucp.getWord(index)]);
	ucp.setWord('000000000000000000000000'+rd.getData().slice(24,32), index);
	pcPlusFour();
}
//25
function lui(rd, rt, value){
	debugStack.push([pc, rd.getName(), rd.getData()]);
	rd.setData(value+'0000000000000000');
	pcPlusFour();

}
//26
// li its an addiu in the binary

//27
function jr(rd, rt, value){
	debugStack.push([pc]);
	pc = twoComplementToInteger(rd.getData());

}
//28
function j(rd, rt, value){
	debugStack.push([pc]);
	pc = twoComplementToInteger(value);
}
//29
function jal(rd, rt, value){
	debugStack.push([pc]);
	pc = twoComplementToInteger(value);
}
//['add', 'sub', 'addu', 'subu', 'slt', 'sltu',  'and', 'nor', 'or', 'sll', 'srl',/**/  0-10
//'ori', 'andi', 'addi', 'addiu', 'slti', 'sltiu',  /**/ 11-16
//'beq', 'bne',  /**/' 17-18
//lw', 'sw', 'lb', 'lbu', 'lhu', 'sb',/**/  19-24
//'lui' 'li', 25-26
//'jr', 27
//'j', 'jal']; 28-29


function UCP(){
	this.MEMORY = [];

	this.registers = [];
	this.registers[0] = new REGISTER('$zero'); 
	this.registers[1] = new REGISTER('$at');
	this.registers[2] = new REGISTER('$v0'); 
	this.registers[3] = new REGISTER('$v1');
	for (var i = 4; i < 8; i++) 
		this.registers[i] = new REGISTER('$a'+(i-4)); 

	for (var i = 8; i < 16; i++) 
		this.registers[i] = new REGISTER('$t'+(i-8)); 
	
	for (var i = 16; i < 24; i++) 
		this.registers[i] = new REGISTER('$s'+(i-16)); 
	
	this.registers[24] = new REGISTER('$t8');
	this.registers[25] = new REGISTER('$t9'); 
	this.registers[26] = new REGISTER('$k0'); 
	this.registers[27] = new REGISTER('$k1'); 
	this.registers[28] = new REGISTER('$gp'); 
	this.registers[29] = new REGISTER('$sp'); 
	this.registers[30] = new REGISTER('$sp'); 
	this.registers[31] = new REGISTER('$ra'); 

}


UCP.prototype.getWord = function(adress){
	var index = parseInt(adress,2);

	var str ='';
	for(var i =0; i<32 ; i++){
		this.MEMORY[index+i] == undefined ? str +='0' : str += this.MEMORY[index+i];
	}
	return str;
}
UCP.prototype.setWord = function(word, adress){

	var index = parseInt(adress,2);
	for(var i =0; i<32 ; i++){
		this.MEMORY[index+i] = word[i];	
	}
	
}

UCP.prototype.getByte = function(adress){
	var str ='000000000000000000000000';
	var index = parseInt(adress,2);
	for(var i =0; i<8 ; i++){
		str += this.MEMORY[index+i];	
	}
	return str;
}
UCP.prototype.setByte = function(word, adress){
	var index = parseInt(adress,2);
	for(var i =0; i<8 ; i++){
		this.MEMORY[index+i] = word[24+i];	
	}
}

function REGISTER(name, data){
	if(data == undefined || data == null || data == '')
		this.data = zero;
	else 
		this.data = data;

	this.name = name;
}
REGISTER.prototype.getData = function(){
	return this.data;
}
REGISTER.prototype.setData = function(newData){
	this.data = newData;
}
REGISTER.prototype.getName = function(){
	return this.name;
}

function integerTo32Bits(number){
	var test = parseInt(number).toString(2);
	var aux='';
	if(number < 0)
		return twoComplement(test, 32);
		
	if(test.length > 32){
		test = test.slice(test.length-32, test.length);
	}else if(test.length < 32){
		for (var i = 0; i< 32-test.length; i++)
			aux +='0';
	}
	return aux + test;
}

function twoComplementToInteger(number){
	var temp = '';
	var aux ='';
	if(number[0] == '1'){
		for (var i = number.length-1; number[i]=='0'; i--) {
			temp += '0';
		}

		temp += '1';

		for (var j = i-1; number[j] != undefined; j--) {
			number[j] == '0' ? temp+='1' : temp+='0'; 
		}

		for (var i = 0; i < number.length; i++) {
			aux += temp[number.length - i -1];
		}

		return -parseInt(aux, 2);

	}else{
		return parseInt(number, 2);
	}
}

function integerToComplemet32bits(number){
	var temp ='';
	var count = 0;
	if(number < 0){
		number = number.toString(2).replace('-','');
		for (var i = number.length-1; number[i]=='0' && number[i]!= undefined && count<32; i--, count++) {
			temp += '0';
		}

		temp +='1';

		for (var j = i-1; count <31; j--, count++) {
			(number[j] == '0'|| number[j] == undefined)? temp+='1' : temp+='0'; 
		}

			for (var j = i-1; count <31; j--, count++) {
		(number[j] == '0'|| number[j] == undefined)? temp+='1' : temp+='0'; 
		}

		var aux = '1';
		for (var i = 1; i < 32; i++) {
			aux += temp [31-i];
		}

		return aux;
			
	}else{
		number = number.toString(2);
		var aux='';
		if(number.length<32){
			for (var i = number.length; i < 32; i++) {
				aux+='0';
			}
			return aux+number;

		}else if(number.length>32){
			return number.slice(number.length-32, number.length);
		}else
			return number;
	}	
}

function integerTo16Bits(number){
	var test = parseInt(number).toString(2);
	var aux='0';
	if(number < 0)
		return twoComplement(test, 16);
		
	if(test.length > 15){
		test = test.slice(test.length-31, test.length);
	}else if(test.length < 15){
		for (var i = 0; i< 15-test.length; i++)
			aux +='0';
	}
	return aux + test;
}


function integerTo26Bits(number){
	var test = parseInt(number).toString(2);
	var aux='0';
	if(number < 0)
		return twoComplement(test, 26);
		
	if(test.length > 25){
		test = test.slice(test.length-31, test.length);
	}else if(test.length < 25){
		for (var i = 0; i< 25-test.length; i++)
			aux +='0';
	}

	return aux + test;
}

function twoComplement(number, bits){
	var temp ='';
	var count = 0;
	number = number.replace('-','');
	for (var i = number.length-1; number[i]!='1' && number[i]!= undefined && count<bits; i--, count++) {
		temp += '0';
	}

	temp +='1';
	for (var j = i-1; count <bits-1; j--, count++) {
		(number[j] == '0'|| number[j] == undefined)? temp+='1' : temp+='0'; 
	}
	var aux = '1';
	for (var i = 1; i < bits; i++) {
		aux += temp [bits-1-i];
	}
	return aux;
}