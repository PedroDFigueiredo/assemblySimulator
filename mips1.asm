addi $t0, $t0, 32
lui $ra, 10
lb  $t0, 0($t0)




addi $s0,$s0,0 # i
addi $s1,$s1,5 # j

#for:
#beq $s0,$s1,SAIR 
addi $s0,$s0,1 # i+=1
#j for

#SAIR:
add $a0,$s1,$zero

