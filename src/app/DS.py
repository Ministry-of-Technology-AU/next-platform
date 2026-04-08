lis1 = [[1,2,3],[4,5,6],[7,8,9]]
lis2=[[1,2,3],[4,5,6],[7,8,9]]
add_lis = [[],[],[]]

for i in range(len(lis1)):
    for j in range(len(lis1[i])):
        add_lis[i].append(lis1[i][j]*lis2[j][i]+9)

print(add_lis)