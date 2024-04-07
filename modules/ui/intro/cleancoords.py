if __name__ == '__main__': 
	ans = []
	first = True
	print('[')
	with open("badinput.txt", "r") as f:
		for line in f:
			if '[' in line:
				if not first:
					print(",")
				first = False
				print(line[line.index('['):-1], end='')
	print(']')




