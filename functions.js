var request = function (url, method, data, type) {
	return new Promise(function (resolve, reject) {
		var posts = data || {}, methods = method || 'GET'
		if (methods.toUpperCase() == 'GET') {
			url += url.indexOf('?') == -1 ? '?' : '&'
			var arr = []
			for (var i in posts) { arr.push(i + '=' + posts[i]) }
			url += arr.join('&')
		} else {
			if (type == 'json') posts = JSON.stringify(posts)
		}
		var request = new XMLHttpRequest()
		request.open(methods.toUpperCase(), url)
		request.setRequestHeader('Request-Type', 'ajax')
		request.send(posts)
		request.onreadystatechange = function () {
			if (request.readyState == 4) {
				if (request.status == 200) {
					resolve(JSON.parse(request.responseText))
				} else {
					reject({ code: 1, msg: '系统繁忙请重试' })
				}
			}
		}
	})
}

var validate = function (target) {
	return new Promise(function (resolve, reject) {
		var rules = {
			empty: /^[\w\W]+$/,
			pwd: /^[^\s]{6,16}$/,
			number: /^\d+$/,
			phone: /^1[0-9]{10}$/,
			cname: /^[\u0391-\uFFE5]{2,15}$/,
			word: /^[\w\W]+$/,
			idcard: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
			card: /^\d{16,20}$/,
			code: /^\d{6}$/,
			zero: /^[1-9]\d*(\.\d+)?$/i
		}
		var evil = function (fn) {
			var Fn = Function
			return new Fn('return ' + fn)()
		}
		var inputs = target.tagName ? target.querySelectorAll('input,textarea,select') : target
		if (inputs.length) {
			var posts = {}, names = []
			for (var i = 0; i < inputs.length; i++) {
				var obj = inputs[i]
				var name = obj.getAttribute('name'), type = obj.getAttribute('type')
				if (names.indexOf(name) > -1) continue
				names.push(name)
				if (type == 'radio') {
					var value = document.querySelector('input[name=' + name + ']:checked') ? document.querySelector('input[name=' + name + ']:checked').value : ''
				} else if(type == 'checkbox') {
					var arr = document.querySelectorAll('input[name="' + name + '"]:checked') || [], valarr = []
					arr.forEach(function (item) { valarr.push(item.value) })
					var value = valarr
				} else {
					var value = obj.value
				}
				
				if (name) posts[name] = value
				var rule = obj.getAttribute('data-rule')
				if (rule == null) continue
				var errmsg = obj.getAttribute('data-errmsg') || obj.getAttribute('placeholder') || '验证失败'
				
				var regRule = rule && rule.indexOf('/') > -1 ? evil(rule) : rules[rule]
				if (regRule) {
					if (!regRule.test(value)) {
						obj.focus()
						reject({ ele: obj, msg: errmsg })
						break
					}
				}
			}
			resolve(posts)
		}
	})
}

var parseDate = function (dates, types, formate) {
	var types = types || 'days'
	switch (types) {
		case 'days':
			var times = (new Date(dates.replace(/-/g,'/'))).getTime(), now = (new Date()).getTime(), hours = 1000 * 60 * 60, days = 1000 * 60 * 60 * 24
			var diff = now - times, str = ''
			if (diff < 0) return dates
			if (diff >= days * 30) {
				str = dates.length > 10 ? dates.substring(0, 10) : dates
			} else if (diff >= days) {
				str = Math.floor(diff / days) + '天前'
			} else {
				str = Math.ceil(diff / hours) + '小时前'
			}
			return str
		break
		case 'chat':
			var old = new Date(dates.replace(/-/g,'/')), now = new Date(), str = ''
			if (old.getFullYear() < now.getFullYear()) {
				str = dates.substring(dates.length - 3)
			} else if (old.getMonth() < now.getMonth()) {
				str = dates.substring(5, dates.length - 3)
			} else if (old.getDate() < now.getDate()) {
				str = dates.substring(5, dates.length - 3)
			} else {
				str = dates.substring(11, dates.length - 3)
			}
			return str
		break
		case 'date':
			var date = new Date(dates * 1000)
			var arr = { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), h: date.getHours(), i: date.getMinutes(), s: date.getSeconds() }
			var sparator = (formate || 'y-m-d h:i').split('')
			sparator.forEach((v, k) => { if (arr[v]) sparator[k] = arr[v] < 10 ? '0' + arr[v] : arr[v] })
			return sparator.join('')
		break
		default:
			return dates.length > 10 ? dates.substring(0, 10) : dates
	}
}
