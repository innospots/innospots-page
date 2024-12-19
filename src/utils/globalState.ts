import LS from './localStorage';
import { entryParameters } from '../config/entryParameters';
import { setComponents } from './sharedComponents';
export type DatartComponentConfig = {
  pageId?: string,
  code: string,
  operateType: string,
  titleElement?: DatartConfElement[],
  urls:{
    viewsUrl: string,
    viewDetailUrl: string,
    dataUrl: string,
    applicationsUrl?: string,
    detailUrl: string,
    saveBoardUrl: string,
    publicBoardUrl?: string,
    fileUploadUrl: string,
    functionSupportUrl: string,
    functionValidateUrl: string,
    editBoardPageUrl?: string,
  },
  applicationEnable?: boolean | false,
  applications?: string[],
  onGlobalStateChange?: any,
}
export type DatartConfElement ={
  label?: string,
  name: string,
  desc?: string,
  placeholder: string,
  required: boolean,
  type: string,
  tips?: string,
  gridSize: number,
  defaultValue?: any,
  length?: number,
  options?: DatartConfElementOption[],
  requestOption?: DatartConfElementRequestOption
}
type DatartConfElementOption = {
  name: string,
  value: any
}
type DatartConfElementRequestOption = {
  requestUrl: string,
  nameField: string,
  valueFiled: string
}
export type DatartComponentProps = {
  dashboardId: string;
  renderMode: string;
  hideTitle?: boolean;
  locale?: string;
  config: DatartComponentConfig;
  onCloseBoardEditor?: ()=>void;
  onCloseBoard?: ()=>void;
  onSuccessUpdateBoard?: (updateBoardId: string)=>void;
}

let curMasterState = {};
export const POWERED_BY_QIANKUN = (window as any).__POWERED_BY_QIANKUN__;

export const setMasterState = (data: any) => {
  curMasterState = data;
  setComponents("core", data.componentContent)
}

export const getMasterState = (): any => curMasterState;

// export const getCurrentLanguage


export const saveSessionData = (userData: any) => {
  LS.set(LS.LOCAL_DATA_KEY, JSON.stringify(userData))
}

export const getSessionData = (): any => {
  if (POWERED_BY_QIANKUN) {
    try {
      return getMasterState().getSessionData()
    } catch (e) {}
  } else {
    const userData = LS.get(LS.LOCAL_DATA_KEY);

    if (userData) {
      return JSON.parse(userData);
    } else {
      return null;
    }
  }
}
let globalConfigState:DatartComponentConfig = {} as DatartComponentConfig;
export const getGlobalConfigState = () => globalConfigState;
export const setGlobalConfigState = (props: any) => {
  let config = entryParameters.page;
  if (POWERED_BY_QIANKUN && props) {
   if(props.pageType){
      config = entryParameters[props.pageType];
    }
    if(props.operateType){
      config.operateType = props.operateType;
      if(props.operateType=='CREATE'){
        config.urls.detailUrl= '';
      }
    }
   if(props.config){
     config = {
       ...config,
       ...props.config
     };
   }
    if(props.id){
      config.pageId = props.id
    }
  }

  config.onGlobalStateChange = props.onGlobalStateChange || globalConfigState.onGlobalStateChange;
  globalConfigState = config;
}
