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

import { Col, Input, Row, Select, Space, Tabs, TreeDataNode } from 'antd';
import { FormItemEx, Tree } from 'app/components';
import { ChartDataViewFieldCategory, DataViewFieldType } from 'app/constants';
import useI18NPrefix from 'app/hooks/useI18NPrefix';
import { ViewType } from 'app/pages/MainPage/pages/ViewPage/slice/types';
import { ChartDataViewMeta } from 'app/types/ChartDataViewMeta';
import { ChartComputedFieldHandle } from 'app/types/ComputedFieldEditor';
import { hasAggregationFunction } from 'app/utils/chartHelper';
import { FC, useCallback, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import ChartComputedFieldEditor from './ChartComputedFieldEditor/ChartComputedFieldEditor';
import ChartSearchableList from './ChartSearchableList';
import ComputedFunctionDescriptions from './computed-function-description-map';
import { FieldTemplate, FunctionTemplate, VariableTemplate } from './utils';

enum TextType {
  Field = 'field',
  Variable = 'variable',
  Function = 'function',
}

const ChartComputedFieldSettingPanel: FC<{
  sourceId?: string;
  computedField?: ChartDataViewMeta;
  allComputedFields?: ChartDataViewMeta[];
  fields?: ChartDataViewMeta[] | TreeDataNode[];
  variables?: ChartDataViewMeta[];
  viewType?: ViewType;
  onChange?: (computedField?: ChartDataViewMeta) => void;
}> = ({
  sourceId,
  computedField,
  allComputedFields,
  fields,
  variables,
  viewType,
  onChange,
}) => {
  const t = useI18NPrefix(`viz.workbench.dataview`);
  const defaultFunctionCategory = 'all';
  const editorRef = useRef<ChartComputedFieldHandle>(null);
  const myComputedFieldRef = useRef(computedField);
  const [selectedFunctionCategory, setSelectedFunctionCategory] = useState(
    defaultFunctionCategory,
  );

  const handleChange = (field: ChartDataViewMeta) => {
    const hasAggregation = hasAggregationFunction(field?.expression);
    field.category = hasAggregation
      ? ChartDataViewFieldCategory.AggregateComputedField
      : ChartDataViewFieldCategory.ComputedField;
    myComputedFieldRef.current = field;
    onChange?.(field);
  };

  const handleFieldNameChange = name => {
    const newField = Object.assign({}, myComputedFieldRef.current, {
      name: name,
    });
    handleChange(newField);
  };

  const handleFieldTypeChange = type => {
    const newField = Object.assign({}, myComputedFieldRef.current, { type });
    handleChange(newField);
  };

  const handleExpressionChange = expression => {
    const newField = Object.assign({}, myComputedFieldRef.current, {
      expression,
    });
    handleChange(newField);
  };

  const getFunctionCategories = (): Array<{ label; value }> => {
    const functionCategories = ComputedFunctionDescriptions.reduce<string[]>(
      (acc, cur) => {
        if (acc.find(x => x === cur.type)) {
          return acc;
        }
        return acc.concat([cur.type]);
      },
      [],
    );

    return [defaultFunctionCategory, ...functionCategories].map(item => ({
      label: item,
      value: item,
    }));
  };

  const handleFunctionCategoryChange = category => {
    setSelectedFunctionCategory(category);
  };

  const getFunctionList = () => {
    return ComputedFunctionDescriptions.filter(
      item =>
        item.type === selectedFunctionCategory ||
        !selectedFunctionCategory ||
        selectedFunctionCategory === defaultFunctionCategory,
    ).map(item => ({
      label: item.name,
      value: item.name,
    }));
  };

  const getInputText = (value, type) => {
    switch (type) {
      case TextType.Field:
        return FieldTemplate(value);
      case TextType.Variable:
        return VariableTemplate(value);
      case TextType.Function:
        return FunctionTemplate(value);
      default:
        return value;
    }
  };

  const handleFieldFunctionSelected = funName => {
    const functionDescription = ComputedFunctionDescriptions.find(
      f => f.name === funName,
    );

    editorRef.current?.insertField(
      getInputText(funName, TextType.Function),
      functionDescription,
    );
  };

  const handleFieldSelected = useCallback(field => {
    editorRef.current?.insertField(getInputText(field, TextType.Field));
  }, []);

  const handleVariableSelected = variable => {
    editorRef.current?.insertField(getInputText(variable, TextType.Variable));
  };

  const handleOnSelectValue = useCallback(
    selectKeys => {
      if (selectKeys?.length) {
        const selectKey = selectKeys[0] as any;
        handleFieldSelected(selectKey);
      }
    },
    [handleFieldSelected],
  );

  return (
    <StyledChartComputedFieldSettingPanel direction="vertical">
      <Row gutter={24}>
        <Col span={12}>
            <FormItemEx
              label={`${t('field')}${t('fieldName')}`}
              name="fieldName"
              rules={[{ required: true }]}
              initialValue={myComputedFieldRef.current?.name}
              style={{marginLeft: 10}}
            >
              <Input onChange={e => handleFieldNameChange(e.target.value)}  style={{width: 338, height: 38, marginLeft: 10}}/>
            </FormItemEx>
        </Col>
        <Col span={12}>
            <FormItemEx
              label={`${t('field')}${t('type')}`}
              name="type"
              rules={[{ required: true }]}
              initialValue={myComputedFieldRef.current?.type}
            >
              <Select
                value={myComputedFieldRef.current?.type}
                options={Object.keys(DataViewFieldType).map(type => {
                  return {
                    label: type,
                    value: DataViewFieldType[type],
                  };
                })}
                style={{width: 338, marginLeft: 10}}
                onChange={handleFieldTypeChange}
              ></Select>
            </FormItemEx>
        </Col>
      </Row>
      <Row gutter={24} style={{marginTop: 16,marginLeft: 0}}>
        <Col span={5}  className="field-info">
          <Tabs defaultActiveKey="field" onChange={() => {}}>
            <Tabs.TabPane tab={`${t('field')}`} key="field">
              {viewType === 'STRUCT' ? (
                <Tree
                  className="medium"
                  loading={false}
                  showIcon={false}
                  treeData={fields as TreeDataNode[]}
                  defaultExpandAll={true}
                  height={500}
                  onSelect={handleOnSelectValue}
                />
              ) : (
                <ChartSearchableList
                  source={(fields || []).map(f => ({
                    value: f.name,
                    label: f.name,
                    type: f.type,
                  }))}
                  onItemSelected={handleFieldSelected}
                />
              )}
            </Tabs.TabPane>
            <Tabs.TabPane tab={`${t('variable')}`} key="variable">
              <ChartSearchableList
                source={(variables || []).map(f => ({
                  value: f.name,
                  label: f.name,
                }))}
                onItemSelected={handleVariableSelected}
              />
            </Tabs.TabPane>
          </Tabs>
        </Col>
        <Col span={14} style={{paddingLeft: 0}}>
          <ChartComputedFieldEditor
            ref={editorRef}
            value={myComputedFieldRef.current?.expression}
            functionDescriptions={ComputedFunctionDescriptions}
            onChange={handleExpressionChange}
          />
        </Col>
        <Col span={5}>
          <Space direction="vertical">
            <span className="function-title">{`${t('functions')}`}</span>
            <Select
              value={selectedFunctionCategory}
              options={getFunctionCategories()}
              onChange={handleFunctionCategoryChange}
              className="function-category"
            />
            <ChartSearchableList
              source={getFunctionList()}
              onItemSelected={handleFieldFunctionSelected}
            />
          </Space>
        </Col>
      </Row>
    </StyledChartComputedFieldSettingPanel>
  );
};

export default ChartComputedFieldSettingPanel;

const StyledChartComputedFieldSettingPanel = styled(Space)`
  width: 100%;
  margin-top: 6px;

  .ant-select {
    width: 100%;
  }
  .ant-select-single:not(.ant-select-customize-input) .ant-select-selector, .ant-form-item-label>label{
    height: 38px;
  }
  .ant-select-single .ant-select-selector .ant-select-selection-item, .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
    line-height: 38px;
  }
  .field-info{
    paddingRight: 0;
    border: 1px solid #F5F5F5;
  }
  .ant-tabs-tab{
    padding: 8px 0;
  }

  .ant-space-horizontal {
    width: 100%;
    .ant-space-item:last-child {
      flex: 1;
    }
  }

  .ant-form-item-control-input {
    width: 200px;
  }

  & .searchable-list-container {
    height: 300px;
  }

  .function-title{
    font-size: 16px;
    line-height: 26px;
    font-weight: bold;
    margin-top: 16px;
  }
  .function-category{
    margin: 8px 0;
  }
`;
