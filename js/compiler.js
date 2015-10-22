/*
	TRATAR OVERFLOW EM ADDI E OUTROS


	features

		*passo a passo  debug
		*autocomplite
		*salvar o estado da memória e registrador no banco, 

*/
var labels = [];
var labelsBin = [];
var pc= 0;
var line = 0;
var CODE = '';
var codeLineCount =0;
function startUpCompiler(code){
	CODE = code;
	errorLog = '';
	var lines = code.split('\n');
	var binary = '';
	var count='';
	codeLineCount = 0;
	labels = [];
	labelsBin = [];
	pc = 0;

	labelSearch();

	for (var i = 0; i < lines.length; i++) {
		count += (i+1)+'\n';
		line = i+1;
		var codeLine = lines[i];

		if((/\S/.test(codeLine)) && !(/^\s*\#/.test(codeLine))){//check if the line is empty or a comment
			var test = getInstruction(codeLine);
			if(test != null){
				binary += test[0];
				pc++;
				if(/\S/.test(test[1]))
					commentSyntax(test[1]);
			} 
		}	
	}

	return [binary, count];
}

function labelSearch(){
	var pc = 0;
	var lines = CODE.split('\n');
	var regex = new RegExp("^[\\s]*[\\w]+[\\s]*[\:]");
	for (var i = 0; i < lines.length; i++) {
		line = i+1;
		var codeLine = lines[i];
		if(regex.test(codeLine)){ // if the line is a pointer label 
			var test = codeLine.match(regex)[0]; // take the label
			var label =  test.split(/\s/).join('').replace(':','');
			var index = labels.indexOf(label); 
			if(index < 0){   // check if the label is in the table
				var j = i;
				labels.push(label); 

				while((j < lines.length) && (!(/\S/.test(lines[j])) || (/^[\\s]*[\\w]+[\\s]*[\:][\\s]*(\#|$)/.test(lines[j]))) && !(/^\s*\#/.test(lines[j]))){
					//  search for the next instruction
					j++;
				}
				
				labelsBin.push(pc); 
				var re = new RegExp('^[\\s]*[\\w]+[\\s]*[\:][\\s]*(\#|$)');
				if(!re.test(lines[j])){
					pc++;
				}
			}else{
				errorLog += line+': error: label \"'+label+'\" already defined  \n';
			}
		}else if((/\S/.test(codeLine)) && !(/^\s*\#/.test(codeLine))){
			pc++;
		}
	}
}

function commentSyntax(code){
	var regex = /^[\s]*[\#]/
	var test = regex.exec(code);

	if(test == null)
		errorLog += line + ': error: to post a comment put ***#*** \n';

}

function getInstruction(code){
	var regex = new RegExp('^[\\s]*[\\w]+[\\s]*[\:]');
	if(regex.test(code)){
		code = code.split(regex).join('');
	}
	if(!(/\S/.test(code)) || (/^\s*\#/.test(code))) // comment or blank line
		return ;
	
	//var myRe = /^[\s]*add[\s]+|^[\s]*sub[\s]+|^[\s]*slt[\s]+|^[\s]*jr[\s]+|^[\s]*addi[\s]+|^[\s]*lw[\s]+|^[\s]*sw[\s]+|^[\s]*lb[\s]+|^[\s]*sb[\s]+|^[\s]*beq[\s]+|^[\s]*bne[\s]+|^[\s]*slti[\s]+|^[\s]*lui[\s]+|^[\s]*j[\s]+|^[\s]*jal[\s]+/;
	var myRe = /^[\s]*(lhu|lbu|addiu|andi|ori|srl|sll|sb|or|nor|and|add|sub|addu|subu|slt|lb|sltiu|slti|jr|addi|lw|sw|bne|beq|slti|lui|j|jal|li)[\s]+/;
	var test = myRe.exec(code);

	if(test == null){
		errorLog += line + ': error: Unknown instruction \n';
		return;
	}else{


//['add', 'sub', 'addu', 'subu', 'slt', 'sltu',  'and', 'nor', 'or', 'sll', 'srl',/**/  0-10
//'ori', 'andi', 'addi', 'addiu', 'slti', 'sltiu',  /**/ 11-16
//'beq', 'bne',  /**/' 17-18
//lw', 'sw', 'lb', 'lbu', 'lhu', 'sb',/**/  19-24
//'lui', 'li' 25-26
//'jr', 27
//'j', 'jal']; 28-29
	

		var index = instructions.indexOf(test[0].split(/\s/).join(''));
		codeLineCount++;
	//	console.log(index);
		if(index <28){   //se a função for tipo I ou R
			var test = registerSyntax(code.replace(test[0], ''));
			if(test == null)return null;
			var rd = registersBin[registers.indexOf(test[0])];

			if(index < 19){ // $rd, $rs, 
				test = commaSyntax(test[1]);	
				if(test==null) return null;

				test = registerSyntax(test);
				if(test == null)return null;
				var rs = registersBin[registers.indexOf(test[0])];

				test = commaSyntax(test[1]);	
				if(test==null) return null;

				if(index<9){// $rd, $rs, $rt
					test = registerSyntax(test);
					if(test == null)return null;
					var rt = registersBin[registers.indexOf(test[0])];
					return [instructionsBin[index] + rs + rt + rd + '00000' + instructionsFuncs[index], test[1]];
				
				}else if(index<11){ // $rd, $rs, 
					test = numberSytanx(test);
					if(test == null)return null;
					return [instructionsBin[index] + '00000' + rs + rd + test[1].slice(11, test[1].length) + instructionsFuncs[index], test[0]];									

				}else if(index<17){ // $rd, $rs, number
					test = numberSytanx(test);
					if(test == null)return null;
					return [instructionsBin[index] + rs + rd + test[1] , test[0]];

				}else { // $rd, $rs, label
					test = labelSyntax(test);
					if(test == null)return null;
					return [instructionsBin[index] + rd + rs + integerTo16Bits(test[1]), test[0]];
				}

			}else if(index< 25){ // $rd, n($rt)
				test = commaSyntax(test[1]);	
				if(test==null) return null;

				test = lwSyntax(test, rd);
				if(test==null) return null;				

				return [instructionsBin[index] + test[1], test[0]];

			}else if(index == 25 || index==26){  //lui
				test = commaSyntax(test[1]);	
				if(test==null) return null;

				test = numberSytanx(test);
				if(test == null)return null;
				//console.log(rd+'----'+rt);
				return [instructionsBin[index] + '00000' + rd + test[1], test[0]];

			}else // jr $rd
				return [instructionsBin[index] + rd + '000000000000000001000', test[1]];
		
		}else { // jal label || j label
			test = labelSyntax(code.replace(test[0], ''));
			if(test==null) return null;
			if(index == 29) {
				ucp.registers[31].setData(integerToComplemet32bits(pc));
		//		console.log(pc+'---pc de merda----/'+test[1]);
			}
			return [instructionsBin[index] + integerTo26Bits(test[1]+pc+1), test[0]];
		}
	}
}

function labelSyntax(code){
	if(!/\S/.test(code)){
		errorLog += line + ': error: missing label \n';
		return null;
	}
	var regex = /^[\w]+[\s]*/;
	var test = regex.exec(code);

	if(test == null){
		errorLog += line + ': error: missing label \n';
		return null;
	}
	var label = test[0].split(/\s/).join('');
	var index = labels.indexOf(label);

	if(index<0){
		errorLog += line + ': error: \''+label+'\' not pointed \n'; //CHANGE THAT SHIT
		return null;
	}

	var distance = labelsBin[index] - codeLineCount;
	return [code.replace(regex, ''), distance];
}


function lwSyntax(code, rt){
	if(!/\S/.test(code)){
		errorLog += line + ': error: missing an operand \n';
		return null;
	}

	var test = numberSytanx(code);

	if(test == null) return null;

	var number = test[1];
	code = test[0];
	var regex = /^[\s]*\([\s]*/
	test = regex.exec(code);

	if(test == null){
		errorLog += line + ': error: missing open parentesis \n';
		return null;
	}
	code = code.replace(regex, '');

	test = registerSyntax(code);

	if(test == null)return null;
	var rd = registersBin[registers.indexOf(test[0])];
	code = test[1];

	var regex = /^[\s]*\)[\s]*/

	test = regex.exec(code);

	if(test == null){
		errorLog += line + ': error: missing close parentesis \n';
		return null;
	}

	return [code.replace(regex, ''), rd + rt + number];
}


function registerSyntax(code){
	if(!/\S/.test(code) || code == ''){
		errorLog += line + ': error: missing register \n';
		return null;
	}

	var regex = /^[\s]*\$[s|t][0-7][\s]*|^[\s]*\$[t][8-9][\s]*|^[\s]*\$[k,v][0-1][\s]*|^[\s]*\$[a][0-3|t][\s]*|^[\s]*\$zero[\s]*|^[\s]*\$[s|f|g]p[\s]*|^[\s]*\$ra[\s]*/;
	var test = regex.exec(code);
	if (test == null) {
		errorLog += line + ': error: Unknown register \n';
		return null;
	} 

	return [test[0].split(/\s/).join(''), code.replace(regex, '')];
}

function commaSyntax(code){
	var regex = /^[\s]*,[\s]*/
	var array = regex.exec(code);

	if (array == null) {
		errorLog += line + ': error: missing ***,***  \n';
		return null;
	}
	return code.replace(regex, '');
}

function numberSytanx(code){
	var regex = /^[\s]*[\-]*\d+[\s]*/;
	var array = regex.exec(code);
	if (array == null) {
		errorLog += line + ': error: mising an operand  \n';
		return null;
	}

	return [code.replace(regex, ''), integerTo16Bits(array[0].split(/\s/).join(''))];
}

