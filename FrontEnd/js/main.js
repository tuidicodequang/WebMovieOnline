'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Filter
        --------------------*/
        $('.filter__controls li').on('click', function () {
            $('.filter__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.filter__gallery').length > 0) {
            var containerEl = document.querySelector('.filter__gallery');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    // Search model
    $('.search-switch').on('click', function () {
        $('.search-model').fadeIn(400);
    });

    $('.search-close-switch').on('click', function () {
        $('.search-model').fadeOut(400, function () {
            $('#search-input').val('');
        });
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });

    /*------------------
		Hero Slider
	--------------------*/
    var hero_s = $(".hero__slider");
    hero_s.owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: true,
        nav: true,
        navText: ["<span class='arrow_carrot-left'></span>", "<span class='arrow_carrot-right'></span>"],
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true,
        mouseDrag: false
    });

    /*------------------
        Video Player
    --------------------*/
    const player = new Plyr('#player', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'captions', 'settings', 'fullscreen'],
        seekTime: 25
    });

    /*------------------
        Niceselect
    --------------------*/
    $('select').niceSelect();

    /*------------------
        Scroll To Top
    --------------------*/
    $("#scrollToTopButton").click(function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });

})(jQuery);

function handleRegister() {
    const form = document.querySelector('form[name="registerForm"]');
    if (!form) return; // Thoát nếu không tìm thấy form

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Xóa thông báo lỗi cũ nếu có
        const oldError = form.querySelector('.error-message');
        if (oldError) oldError.remove();

        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            name: formData.get('name')
        };

        try {
            const response = await fetch('/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Hiển thị popup thành công
                showSuccessPopup();
            } else {
                // Hiển thị lỗi
                showError(result.message, form);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Đã có lỗi xảy ra, vui lòng thử lại sau', form);
        }
    });
}

function showSuccessPopup() {
    const popup = document.createElement('div');
    popup.className = 'popup-modal';
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Đăng ký thành công!</h2>
            <p>Bạn có muốn chuyển sang trang đăng nhập?</p>
            <button class="site-btn" onclick="window.location.href='/login.html'">Login Now</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Đóng popup khi click ra ngoài
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            document.body.removeChild(popup);
        }
    });
}

// Function hiển thị lỗi
function showError(message, form) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.marginTop = '10px';
    form.appendChild(errorDiv);
}

// CSS cho popup
const style = document.createElement('style');
style.textContent = `
    .popup-modal {
        display: flex;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        justify-content: center;
        align-items: center;
    }
    .popup-content {
        background-color: #fefefe;
        padding: 20px;
        border-radius: 5px;
        text-align: center;
        max-width: 400px;
        width: 90%;
    }
`;
document.head.appendChild(style);

// Thêm vào phần khởi tạo (nếu có)
document.addEventListener('DOMContentLoaded', function() {
    // Các khởi tạo khác của bạn (nếu có)
    
    handleRegister(); // Khởi tạo xử lý đăng ký
});


document.addEventListener('DOMContentLoaded', function() {
    // Code hiện có của bạn (nếu có)
    
    // Thêm code xử lý đăng ký
    const form = document.getElementById('registerForm');
    const successModal = document.getElementById('successModal');
    const loginNowBtn = document.getElementById('loginNowBtn');
    const errorMessageDiv = document.getElementById('errorMessage');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Ẩn thông báo lỗi cũ nếu có
            errorMessageDiv.style.display = 'none';

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    // Hiển thị modal thành công
                    successModal.style.display = 'block';
                } else {
                    // Hiển thị thông báo lỗi
                    errorMessageDiv.textContent = result.message;
                    errorMessageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessageDiv.textContent = 'Đã có lỗi xảy ra, vui lòng thử lại sau';
                errorMessageDiv.style.display = 'block';
            }
        });
    }

    // Xử lý nút "Login Now"
    if (loginNowBtn) {
        loginNowBtn.addEventListener('click', function() {
            window.location.href = '/login.html';
        });
    }

    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(event) {
        if (event.target == successModal) {
            successModal.style.display = 'none';
        }
    });
});
    function changeToSlug(title) {
        //Đổi chữ hoa thành chữ thường
        slug = title.toLowerCase();

        //Đổi ký tự có dấu thành không dấu
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        slug = slug.replace(/đ/gi, 'd');
        //Xóa các ký tự đặt biệt
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        //Đổi khoảng trắng thành ký tự gạch ngang
        slug = slug.replace(/ /gi, "-");
        //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
        //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');
        //Xóa các ký tự gạch ngang ở đầu và cuối
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');

        return slug;
    }

    function validateInputFieldsFormBootstrap(){
        //validate form bootstrap
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.classList.add('was-validated')
        })
        //End validate form bootstrap
    }

    //toast
    toastr.options =
    {
                "closeButton" : true,
                "progressBar" : true,
    }
