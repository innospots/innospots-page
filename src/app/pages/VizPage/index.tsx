import React from 'react';
import {useEditBoardSlice} from "../DashBoardPage/pages/BoardEditor/slice";
import {useBoardSlice} from "../DashBoardPage/pages/Board/slice";
import Board from "../DashBoardPage/pages/Board";
import { getGlobalConfigState } from 'utils/globalState';
import BoardEditor from '../DashBoardPage/pages/BoardEditor';

function BoardPage(props) {
  useEditBoardSlice();
  useBoardSlice();

  const configState = getGlobalConfigState();

  console.info(props)

  if(configState.operateType == "VIEW"){
    return (
      <Board
        hideTitle={true}
        autoFit={true}
        filterSearchUrl={''}
        allowDownload={true}
        allowShare={true}
        showZoomCtrl={true}
        allowManage={true}
        renderMode="read"
        key={configState.pageId}
        previewBoardId={configState.pageId}
      />
    );
  }else if(configState.operateType == "EDIT" || configState.operateType == "CREATE"){
    return (
      <BoardEditor />
    );
  }
  return <></>
}
export default BoardPage;
