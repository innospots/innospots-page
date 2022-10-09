import {Button, Cascader, Col, Form, Input, Modal, Radio, Row, Space, Checkbox, Select, message} from 'antd';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import allApp from 'app/assets/images/all_apps.svg';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { editBoardStackActions, editDashBoardInfoActions } from '../../slice';
import {
  addWidgetsToEditBoard
} from '../../slice/thunk';
import {ApplicationInfo, ApplicationWidgetContent} from "app/pages/DashBoardPage/pages/Board/slice/types";
import cls from "classnames";
import {
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import sortBy from 'lodash/sortBy';
import forEach from 'lodash/forEach';
import indexOf from 'lodash/indexOf';
import filter from 'lodash/filter';
import map from 'lodash/map';
import {  SharedComponent } from 'utils/sharedComponents';
import GridLayout, {Layout} from 'react-grid-layout';
import {BoardToolBarContext} from "app/pages/DashBoardPage/pages/BoardEditor/components/BoardToolBar/context/BoardToolBarContext";
import {
   AppWidgetConfig,
   AppWidgetScope
} from "app/pages/DashBoardPage/pages/BoardEditor/components/ApplicationWidgetPanel/types";
import {
  selectApplicationPanel,
  selectControllerPanel
} from "app/pages/DashBoardPage/pages/BoardEditor/slice/selectors";
import widgetManagerInstance from '../../../../components/WidgetManager';
import { ORIGINAL_TYPE_MAP } from '../../../../constants';
import { applicationWidgetsConfig } from 'config/applicationWidgets';
import { getGlobalConfigState } from 'utils/globalState';

export interface ApplicationEditorProps {

}

const ApplicationWidgetPanel: React.FC<ApplicationEditorProps> = memo(() => {
  const dispatch = useDispatch();
  const { urls,code: datartCode,commonParams } = getGlobalConfigState();
  const { type, widgetId,configContent } = useSelector(selectApplicationPanel);
  const gt = useI18NPrefix(`global.modal.title`);
  const {boardId, boardType} = useContext(BoardToolBarContext);
  const [selectedAppKey, setSelectedAppKey] = useState<string>('');
  const [selectedAppWidget,setSelectedAppWidget] = useState<AppWidgetConfig>({} as AppWidgetConfig);
  const [applicationsMap,setApplicationsMap] = useState({} as Map<string,ApplicationInfo>);
  const [selectedWidgets,setSelectedWidgets] = useState([] as AppWidgetConfig[]);
  const [widgetApplicationVisible, setWidgetApplicationVisible] = useState(false);
  const [formIns] = Form.useForm();
  const [formError, setFormError] = useState({});
  useEffect(() => {
    const hide = !type || type === 'hide';
    setWidgetApplicationVisible(!hide);
    if(!hide){
      if(type=="add"){
        setSelectedAppWidget({} as AppWidgetConfig)
      }
        let appMap = {} as Map<string,ApplicationInfo>
        appMap["innospot-libra-app-kernel"] = {
          applicationWigets: [],
          appKey: "innospot-libra-app-kernel",
          kernelVersion: "1.1.0",
          name: "核心模块",
          icon: "/images/app_core_module.png",
          status: 'ONLINE',
          vendor: "",
          version: "v1.1.0",
        };
      setApplicationsMap(appMap);
      setSelectedAppKey("innospot-libra-app-kernel")
    }
  }, [type]);
  useEffect(()=>{
    if(widgetId && configContent){
      const appWidgetConfig = JSON.parse(configContent.appWidgetConfig)
      let formFieldsValues: any = []
      forEach(Object.keys(appWidgetConfig),function (item){
        formFieldsValues.push({
          "name": item,
          "value": appWidgetConfig[item]
        })
      })
      formIns.setFields(formFieldsValues);
      setSelectedAppWidget(configContent.appWidgetInfo)
    }
  },[widgetId, configContent])

  const afterClose = useCallback(() => {
    // offMicroAppGlobalStateChange()
    formIns.resetFields();
    dispatch(
      editDashBoardInfoActions.changeApplicationPanel({
        type: 'hide',
        widgetId: ''
      })
    );
  }, [dispatch, formIns]);

  const onSubmit = useCallback(() => {
    formIns.validateFields().then(values => {
      setImmediate(() => {
        let widget = widgetManagerInstance.toolkit(ORIGINAL_TYPE_MAP.application).create({
          boardType,
          content: {
              applicationInfo: {
                ...applicationsMap[selectedAppKey],
                applicationWigets: null
              },
              appWidgetInfo: selectedAppWidget,
              appWidgetConfig: JSON.stringify(values),
          },
        });
        console.log("widget----",widget,JSON.stringify(values))
        dispatch(addWidgetsToEditBoard([widget]));
        setWidgetApplicationVisible(false);
      });
    }).catch(error => {
      message.info("请输入正确的参数");
    });
  }, [formIns,selectedAppKey,selectedAppWidget,applicationsMap]);

  const appIcon = (appIconSrc)=>{
    if(appIconSrc){
      return ( <img src={appIconSrc} alt="" className="icon" />)
    }
    return (<img src={allApp} alt="" className="icon" />)
  };
  const onAppKeyClick = function(appKey){
    setSelectedAppKey(appKey)
    setSelectedWidgets(applicationsMap[appKey].applicationWigets)
  }

  const renderCategoryList = () => {
    return (
      <ul className="appTypeList">
        {
          Object.keys(applicationsMap).map((appKey: any) => (
            <li
              key={appKey}
              className={cls("listItem", {
                ['active']: selectedAppKey === appKey
              })}
              onClick={() => onAppKeyClick(appKey)}
            >
              <div className="iconInfo">{appIcon(`${applicationsMap[appKey].icon}`)}</div>
              <div className="label">{ applicationsMap[appKey].name ? applicationsMap[appKey].name : '其他应用' }</div>
            </li>
          ))
        }
      </ul>
    )
  }
  const onSearch = (value) =>{
      setSelectedWidgets(filter(applicationsMap[selectedAppKey].applicationWigets,function (item){
        return item.name.indexOf(value)!=-1
      }))
  }
  const selectAppWidget = (appWidget) => {
    setSelectedAppWidget(appWidget);
    let formFieldsValues: any = []
    map(appWidget.configItem,function (configItem){
      if(configItem.defaultValue){
        formFieldsValues.push({
          name: configItem.name,
          value: configItem.defaultValue
        })
      }

    })
    formIns.setFields(formFieldsValues)
  }

  const renderAppsList = () => {
    let layout = [] as Layout[];
    const applicationWidgets = applicationWidgetsConfig;
    //selectedWidgets
    const applicationWidgetsSortByOrder = sortBy(applicationWidgets,function(item){
      return item['order'];
    })
    let curWidth = 0;
    let curHeight = 0;

    const appsComps = map(applicationWidgetsSortByOrder, function(item,index){
      if( !item['enabled'] || indexOf(item.scope,datartCode)==-1){
        return '';
      }
      let width = item['width'];
      let height = item['height'];

      layout.push({
        i: item['code'],
        x: curWidth,
        y: curHeight,
        w: width,
        h: height,
        isDraggable: false,
        isResizable: false
        // static: true
      })
      if(curWidth + width >= 12){
        curWidth = 0;
        curHeight += height;
      }else{
        curWidth += width;
      }
      return (
          <div key={item.code} >
            <div  className="appItem" onClick={()=>{selectAppWidget(item);}} >
              <div className="appSelected" hidden={item.code!=selectedAppWidget.code} ><CheckCircleOutlined className="appSelectedIcon"/></div>
              <SharedComponent name={item['code']} module={item['module'] || 'core'} />
            </div>
          </div>
        )
    })
    return (
      <div className="appList">
        <div className="appContainer" hidden={selectedAppKey == "innospot-libra-app-kernel"}>
        </div>
        <div className="appContainer" hidden={selectedAppKey != "innospot-libra-app-kernel"}>
          <GridLayout className="layout"
                      cols={12}
                      rowHeight={32}
                      width={690}
                      layout={layout}
                      verticalCompact={true}
                      compactType={'vertical'}>
            {appsComps}
          </GridLayout>
        </div>
      </div>
    )
  }

  const getFormItem = (formItem: any) => {
    let element;
    switch (formItem.type) {
      case 'RADIO':
        element = (
          <Radio.Group style={{marginTop: 8}}>
            {
              map(formItem.options, (option) => {
                return <Radio value={option.value}>{option.name}</Radio>;
              })
            }
          </Radio.Group>
        );
        break;
      case 'SELECT':
        element = (
          <Select placeholder={formItem.placeholder} style={{width: '100%', borderRadius: '8px'}}>
            {
              map(formItem.options, (option) => {
                return <Select.Option value={option.value}>{option.name}</Select.Option>;
              })
            }
          </Select>
        );
        break;
      case 'CHECKBOX':
        element = (
          <Checkbox.Group style={{width: '100%', borderRadius: '8px'}}>
            {
              map(formItem.options, (option) => {
                return (
                  <> <Checkbox value={option.value} style={{marginTop: 15}} /> {option.name}<br /></>
                )
              })
            }
          </Checkbox.Group>
        );
        break;
      case 'INPUT':
        element = <Input placeholder={formItem.placeholder} style={{marginTop: 15, borderRadius: 8}} />;
        break;
      default:
        element = "";
        break;
    }
    return (
      <>
        <Col span={Math.max(formItem.gridSize, 2)}>
          <div className={cls('formItem', {['hasError']: !!formError[formItem.name]})}>
            <span style={{paddingTop: 24, display: 'inline-block'}}> {formItem.label}</span>
            <Form.Item
              noStyle
              name={formItem.name}
              label={formItem.name}
              rules={[
                {
                  message: formItem.tips,
                  required: formItem.required,
                },
              ]}
            >
              {element}
            </Form.Item>
            <div className={'error'}>{formError[formItem.name]}</div>
          </div>
        </Col>
      </>
    );
  }
  const renderConfigContent = useCallback(() => {
      return (
        <div className="formContent">
          <div className="formTitle">插件设置</div>
          <Form form={formIns}
                layout="vertical"
                preserve={false}
               >
                  {
                    selectedAppWidget.configItem && selectedAppWidget.configItem.length>0 &&
                    map(selectedAppWidget.configItem, (item) => {
                      return getFormItem(item);
                    })
                  }
          </Form>
        </div>
      )
    }
    ,[selectedAppWidget])

  return (
    <Modal
      title={type=='add'?"新建小组件":"更新小组件"}
      visible={widgetApplicationVisible}
      onOk={onSubmit}
      centered
      destroyOnClose
      width={1120}
      bodyStyle={{padding: 0}}
      afterClose={afterClose}
      onCancel={() => setWidgetApplicationVisible(false)}
    >
      <Container>
        { renderCategoryList() }
        { renderAppsList() }
        { renderConfigContent() }
      </Container>
    </Modal>
  );
});
export default ApplicationWidgetPanel;
const Container = styled.div`
  display: flex;
  flex: 1;
  height: 600px;

  .appTypeList {
    padding: 32px 24px 32px 48px;

    .listItem {
      width: 96px;
      height: 90px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 12px;
      background: #F9FAFF;

      .label {
        font-size: 16px;
        color: #262626;
        margin-top: 8px;
        text-align: center;
      }
      .iconInfo{
        text-align: center;
        padding-top: 20px;
        .icon {
          width: 26px;
          height: 26px;
        }
      }
      &:hover:not(.active) {
        background-color: #E5ECFF;
      }

      &.active {
        cursor: default;
        background-color: #1245FA;
        .label{
          color: #fff;
        }

      }
    }
  }
  .formContent{
    width: 224px;
    padding: 24px 16px;
    overflow: auto;

    .formTitle{
      font-size: 16px;
      font-weight: bold;
      line-height: 26px;
    }
  }
  .appList{
    flex: 1;
    overflow-y: auto;

    .appContainer{
      display: flex;
      flex-wrap: wrap;

      .appItem{
        margin-left: 24px;
        margin-top: 12px;
        position: relative;
        box-shadow: 0px 4px 10px rgb(0 0 0 / 10%);

        .appSelected{
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.3);
          text-align: right;
          z-index: 99999;
        }
        .appSelectedIcon{
          color: #15AD31;
          font-size: 22px;
          margin-top: 3px;
          margin-right: 3px;
          opacity: 1;
        }
        .appItemContent{
            width: 100%;
            height: 100%;
        }
      }
    }
  }
  `
