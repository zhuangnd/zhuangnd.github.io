function simplifyNum(number) {
	if (!number && number != 0) return number;
	var str_num
	if (number >= 1E3 && number < 1E4) {
		str_num = number / 1E3
		return str_num + '千'
	} else if (number >= 1E4 && number < 1E6) {
		str_num = number / 1E4
		return str_num + '万'
	} else if (number >= 1E6 && number < 1E7) {
		str_num = number / 1E6
		return str_num + '百万'
	} else if (number >= 1E7 && number < 1E8) {
		str_num = number / 1E7
		return str_num + '千万'
	} else if (number >= 1E8 && number < 1E10) {
		str_num = number / 1E8
		return str_num + '亿'
	} else if (number >= 1E10 && number < 1E11) {
		str_num = number / 1E10
		return str_num + '百亿'
	} else if (number >= 1E11 && number < 1E12) {
		str_num = number / 1E11
		return str_num + '千亿'
	} else if (number >= 1E12) {
		str_num = number / 1E12
		return str_num + '万亿'
	} else { //一千以下
		return number
	}
}
//console.log(simplifyNum(100000))