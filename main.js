
// Đối tượng Validator
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Hàm thực hiện Validate 
    function validate(inputElement, rule) {
        //  value: inputElement.value
        // test function: rule.test
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của Selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng Rules và kiểm tra 
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);

            // Nếu có lỗi dừng việc kiểm tra
            if(errorMessage) break; 
        }
        
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Lấy Element của form cần validate 
    var formElement = document.querySelector(options.form);

    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // Thực liện lặp qua từng rules và Validate
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp submit với Javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function(values,input) {
                        values[input.name] = input.value;
                        return  values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Trường hợp submit vs hành vi mặc định
                else {
                    formElement.submit(); 
                }
            } 
        }

        // Lặp qua mỗi Rules và xử lý ( lắng nghe sự kiện Blur, input, ...)
        options.rules.forEach(function(rule) {

            // Lưu lại các Rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // Xử lý trường hợp blur ra khỏi input 
                inputElement.onblur = function() {
                    validate(inputElement, rule);
                };

                // Xử lý mỗi khi người dùng nhập vào input 
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');
                    
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                
                };
            }  
        });
    }
}


// Định nghĩa các rules 
Validator.isRequired = function(selector, message) {
    return {
        selector: selector ,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này!';
        }
    };

}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector ,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            return regex.test(value)? undefined :  message || 'Vui lòng nhập đúng định dạng email!';
        }
    };
}

Validator.minLength = function(selector, min, message) {
    return {
        selector: selector ,
        test: function(value) {
            
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự.`;
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác !'
        }
    }
}   