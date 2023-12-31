/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Tabs } from 'antd';
import { PaneWrapper } from 'app/components';
import useComputedState from 'app/hooks/useComputedState';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import ChartI18NContext from 'app/pages/ChartWorkbenchPage/contexts/Chart18NContext';
import ChartPaletteContext from 'app/pages/ChartWorkbenchPage/contexts/ChartPaletteContext';
import { ChartConfigReducerActionType } from 'app/pages/ChartWorkbenchPage/slice/constant';
import { currentDataViewSelector } from 'app/pages/ChartWorkbenchPage/slice/selectors';
import { ChartConfigPayloadType } from 'app/pages/ChartWorkbenchPage/slice/types';
import { selectVizs } from 'app/pages/MainPage/pages/VizPage/slice/selectors';
import {
  ChartConfig,
  ChartDataConfig,
  ChartStyleConfig,
} from 'app/types/ChartConfig';
import ChartDataView from 'app/types/ChartDataView';
import { FC, memo } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import {
  BORDER_RADIUS, FONT_WEIGHT_BOLD,
  FONT_WEIGHT_MEDIUM,
  SPACE_MD,
} from 'styles/StyleConstants';
import { cond, isEmptyArray } from 'utils/object';
import ChartToolbar from '../ChartToolbar';
import ChartDataConfigPanel from './ChartDataConfigPanel';
import ChartStyleConfigPanel from './ChartStyleConfigPanel';
import ChartGraphPanel from "../ChartGraphPanel";
import {IChart} from "../../../../../../types/Chart";

const { TabPane } = Tabs;

const CONFIG_PANEL_TABS = {
  DATA: 'data',
  STYLE: 'style',
  SETTING: 'setting',
  INTERACTION: 'interaction',
};

const ChartConfigPanel: FC<{
  dataView?: ChartDataView;
  chartId?: string;
  chart?: IChart;
  onChartChange: (c: IChart) => void;
  chartConfig?: ChartConfig;
  expensiveQuery?: boolean;
  onChange: (type: string, payload: ChartConfigPayloadType) => void;
}> = memo(
  ({ chartId, chart, onChartChange, chartConfig, expensiveQuery, onChange }) => {
    const t = useI18NPrefix(`viz.palette`);
    const vizs = useSelector(selectVizs);
    const dataview = useSelector(currentDataViewSelector);
    const [tabActiveKey, setTabActiveKey] = useComputedState(
      () => {
        return cond(
          [config => !isEmptyArray(config?.styles), CONFIG_PANEL_TABS.STYLE],
          [
            config => !isEmptyArray(config?.settings),
            CONFIG_PANEL_TABS.SETTING,
          ],
          [
            config => !isEmptyArray(config?.interactions),
            CONFIG_PANEL_TABS.INTERACTION,
          ],
        )(chartConfig, CONFIG_PANEL_TABS.STYLE);
      },
      (prev, next) => prev !== next,
      chartId,
    );

    // const onDataConfigChanged = (
    //   ancestors,
    //   config: ChartDataConfig,
    //   needRefresh?: boolean,
    // ) => {
    //   onChange?.(ChartConfigReducerActionType.DATA, {
    //     ancestors: ancestors,
    //     value: config,
    //     needRefresh,
    //   });
    // };

    const handleConfigChangeByAction =
      (actionType: string) =>
      (
        ancestors: number[],
        config: ChartStyleConfig,
        needRefresh?: boolean,
      ) => {
        onChange?.(actionType, {
          ancestors: ancestors,
          value: config,
          needRefresh,
        });
      };
    return (
      <ChartI18NContext.Provider value={{ i18NConfigs: chartConfig?.i18ns }}>
        <ChartPaletteContext.Provider value={{ datas: chartConfig?.datas }}>
          <StyledChartGraphPanel>
            <div className="graph-panel-title">
              <span className="common-title">图表类型</span>
            </div>
            <ChartGraphPanel
              chart={chart}
              chartConfig={chartConfig}
              onChartChange={onChartChange}
            />
          </StyledChartGraphPanel>
          <StyledChartDataViewPanel>
            {/*<ChartToolbar />*/}
            <ConfigBlock>
              <Tabs
                activeKey={tabActiveKey}
                className="tabs"
                onChange={setTabActiveKey}
              >
                {/*{!isEmptyArray(chartConfig?.datas) && (*/}
                {/*  <TabPane*/}
                {/*    tab={*/}
                {/*      <span>*/}
                {/*        <DatabaseOutlined />*/}
                {/*        {t('title.content')}*/}
                {/*      </span>*/}
                {/*    }*/}
                {/*    key={CONFIG_PANEL_TABS.DATA}*/}
                {/*  />*/}
                {/*)}*/}
                {!isEmptyArray(chartConfig?.styles) && (
                  <TabPane
                    tab={
                      <span>
                        {/*<DashboardOutlined />*/}
                        {t('title.design')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.STYLE}
                  />
                )}
                {!isEmptyArray(chartConfig?.settings) && (
                  <TabPane
                    tab={
                      <span>
                        {/*<SettingOutlined />*/}
                        {t('title.setting')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.SETTING}
                  />
                )}
                {!isEmptyArray(chartConfig?.interactions) && (
                  <TabPane
                    tab={
                      <span>
                        {/*<BlockOutlined />*/}
                        {t('title.interaction')}
                      </span>
                    }
                    key={CONFIG_PANEL_TABS.INTERACTION}
                  />
                )}
              </Tabs>
              {/*<Pane selected={tabActiveKey === CONFIG_PANEL_TABS.DATA}>*/}
              {/*  <ChartDataConfigPanel*/}
              {/*    dataConfigs={chartConfig?.datas}*/}
              {/*    expensiveQuery={expensiveQuery}*/}
              {/*    onChange={onDataConfigChanged}*/}
              {/*  />*/}
              {/*</Pane>*/}
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.STYLE}>
                {tabActiveKey === CONFIG_PANEL_TABS.STYLE ?
                  <ChartStyleConfigPanel
                    i18nPrefix="viz.palette.style"
                    configs={chartConfig?.styles}
                    dataConfigs={chartConfig?.datas}
                    onChange={handleConfigChangeByAction(
                      ChartConfigReducerActionType.STYLE,
                    )}
                  />
                  : '' }
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.SETTING}>
                {tabActiveKey === CONFIG_PANEL_TABS.SETTING ?
                  <ChartStyleConfigPanel
                    i18nPrefix="viz.palette.setting"
                    configs={chartConfig?.settings}
                    dataConfigs={chartConfig?.datas}
                    onChange={handleConfigChangeByAction(
                      ChartConfigReducerActionType.SETTING,
                    )}
                  /> : '' }
              </Pane>
              <Pane selected={tabActiveKey === CONFIG_PANEL_TABS.INTERACTION}>
                {tabActiveKey === CONFIG_PANEL_TABS.INTERACTION ?
                  <ChartStyleConfigPanel
                    i18nPrefix="viz.palette.interaction"
                    configs={chartConfig?.interactions}
                    dataConfigs={chartConfig?.datas}
                    context={{ vizs, dataview }}
                    onChange={handleConfigChangeByAction(
                      ChartConfigReducerActionType.INTERACTION,
                    )}
                  /> : '' }
              </Pane>
            </ConfigBlock>
          </StyledChartDataViewPanel>
        </ChartPaletteContext.Provider>
      </ChartI18NContext.Provider>
    );
  },
  (prev, next) =>
    prev.chartConfig === next.chartConfig
    // && prev.chartId === next.chartId &&
    // prev.expensiveQuery === next.expensiveQuery,
);

export default ChartConfigPanel;

const StyledChartDataViewPanel = styled.div`
  display: flex;
  //flex-direction: column;
  height: 100%;
  background-color: ${p => p.theme.componentBackground};
`;
const StyledChartGraphPanel = styled.div`
  .graph-panel-title {
    padding: 24px;
    background-color: ${(p) => p.theme.componentBackground};
  }
  .common-title {
    font-weight: bold;
    font-size: 16px;
    line-height: 26px;
  }
`;
const ConfigBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background-color: ${p => p.theme.componentBackground};
  border-radius: ${BORDER_RADIUS};

  .tabs {
    flex-shrink: 0;
    color: #4E5969;

    .ant-tabs-nav-list .ant-tabs-tab{
      padding: 8px;
      + .ant-tabs-tab {
        margin: 0 0 0 ${SPACE_MD};
      }
    }
    .ant-tabs-nav{
      padding: 0 ${SPACE_MD};
      border-top: 1px solid ${(p) => p.theme.borderColorEmphasis};
    }
    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn{
      color: ${p => p.theme.primary};
      font-weight: ${FONT_WEIGHT_BOLD};
    }
  }
`;

const Pane = styled(PaneWrapper)`
  padding: 0 ${SPACE_MD} 64px;
  overflow-y: auto;
`;
