export class PageSubHeaderLeft implements  ng.IComponentOptions {
  public transclude = true;
  public bindings = {
    tabs: '<',
  };
  public template = `
    <div ng-if="$ctrl.tabs" class="cui-tab cui-tab--tabs cui-tab--subnav">
      <ul class="cui-tab__list" role="tablist">
        <li class="cui-tab__item" role="presentation" ng-repeat="tab in $ctrl.tabs" ui-sref-active="current active">
          <a class="h4" ui-sref="{{::tab.state}}" ng-class="{{::tab.class}}" id="{{::tab.id}}" role="tab">{{::tab.title}}</a>
        </li>
      </ul>
    </div>
    <div ng-if="!$ctrl.tabs" class="page-sub-header__left" ng-transclude></div>
  `;
}
