/**
 * Created by martinc on 18/03/2015.
 */


require(['../common'], function () {
    require(['jquery', 'knockout', 'knocksnap', 'viewmodels/knocksnapDemo.viewmodel', 'domReady!'],
        function ($, ko, ks, knocksnapDemoViewModel) {
            ko.components.register('navbar', { require: 'components/nav' });
            ko.components.register('component-one', { require: 'components/componentOne' });
            ko.components.register('component-two', { require: 'components/componentTwo' });

            ko.applyBindings(new knocksnapDemoViewModel());

         });

});