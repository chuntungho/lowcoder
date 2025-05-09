import { default as AntdSegmented } from "antd/es/segmented";
import { BoolCodeControl } from "comps/controls/codeControl";
import { stringExposingStateControl } from "comps/controls/codeStateControl";
import { ChangeEventHandlerControl } from "comps/controls/eventHandlerControl";
import { LabelControl } from "comps/controls/labelControl";
import { SelectOptionControl } from "comps/controls/optionsControl";
import { styleControl } from "comps/controls/styleControl";
import { AnimationStyle, LabelStyle, SegmentStyle, SegmentStyleType } from "comps/controls/styleControlConstants";
import styled, { css } from "styled-components";
import { UICompBuilder } from "../../generators";
import { CommonNameConfig, NameConfig, withExposingConfigs } from "../../generators/withExposing";
import { formDataChildren, FormDataPropertyView } from "../formComp/formDataConstants";
import {
  selectDivRefMethods,
  SelectInputInvalidConfig,
  SelectInputValidationChildren,
  SelectInputValidationSection,
  useSelectInputValidate,
} from "./selectInputConstants";
import { Section, sectionNames } from "lowcoder-design";
import { hiddenPropertyView, disabledPropertyView } from "comps/utils/propertyUtils";
import { trans } from "i18n";
import { hasIcon } from "comps/utils";
import { RefControl } from "comps/controls/refControl";

import { useContext, useEffect } from "react";
import { EditorContext } from "comps/editorState";
import { migrateOldData, withDefault } from "comps/generators/simpleGenerators";
import { fixOldInputCompData } from "../textInputComp/textInputConstants";

const getStyle = (style: SegmentStyleType) => {
  return css`
    &.ant-segmented:not(.ant-segmented-disabled) {
      &,
      .ant-segmented-item-selected,
      .ant-segmented-thumb,
      .ant-segmented-item:hover,
      .ant-segmented-item:focus {
        color: ${style.text};
        border-radius: ${style.radius};
      }
      .ant-segmented-item {
        padding: ${style.padding};
      }
      .ant-segmented-item-selected,
      .ant-segmented-thumb {
        background: ${style.indicatorBackground};
      }
    }

    &.ant-segmented,
    .ant-segmented-item-selected {
      border-radius: ${style.radius};
    }
    &.ant-segmented, .ant-segmented-item-label {
      font-family:${style.fontFamily};
      font-style:${style.fontStyle};
      font-size:${style.textSize};
      font-weight:${style.textWeight};
      text-transform:${style.textTransform};
      text-decoration:${style.textDecoration};
    }
  `;
};

const Segmented = styled(AntdSegmented)<{ $style: SegmentStyleType }>`
  width: 100%;
  min-height: 24px; // keep the height unchanged when there are no options
  ${(props) => props.$style && getStyle(props.$style)}
`;

const SegmentChildrenMap = {
  defaultValue: stringExposingStateControl("value"),
  value: stringExposingStateControl("value"),
  label: LabelControl,
  disabled: BoolCodeControl,
  onEvent: ChangeEventHandlerControl,
  options: SelectOptionControl,
  style: styleControl(SegmentStyle, 'style'),
  labelStyle: styleControl(LabelStyle , 'labelStyle'),
  animationStyle: styleControl(AnimationStyle, 'animationStyle'),
  viewRef: RefControl<HTMLDivElement>,

  ...SelectInputValidationChildren,
  ...formDataChildren,
};

let SegmentedControlBasicComp = (function () {
  return new UICompBuilder(SegmentChildrenMap, (props) => {
    const [
      validateState,
      handleChange,
    ] = useSelectInputValidate(props);
    return props.label({
      required: props.required,
      style: props.style,
      labelStyle: props.labelStyle,
      animationStyle: props.animationStyle,
      children: (
        <Segmented
          ref={props.viewRef}
          block
          disabled={props.disabled}
          value={props.value.value}
          $style={props.style}
          onChange={(value) => {
            handleChange(String(value));
          }}
          options={props.options
            .filter((option) => option.value !== undefined && !option.hidden)
            .map((option) => ({
              label: option.label,
              value: option.value,
              disabled: option.disabled,
              icon: hasIcon(option.prefixIcon) && option.prefixIcon,
            }))}
        />
      ),
      ...validateState,
    });
  })
    .setPropertyViewFn((children) => (
      <>
        <Section name={sectionNames.basic}>
          {children.options.propertyView({})}
          {children.defaultValue.propertyView({ label: trans("prop.defaultValue") })}
        </Section>

        {["logic", "both"].includes(useContext(EditorContext).editorModeStatus) && (
          <><SelectInputValidationSection {...children} />
          <FormDataPropertyView {...children} />
          <Section name={sectionNames.interaction}>
            {children.onEvent.getPropertyView()}
            {disabledPropertyView(children)}
            {hiddenPropertyView(children)}
          </Section></>
        )}

        {["layout", "both"].includes(useContext(EditorContext).editorModeStatus) && (
          children.label.getPropertyView()
        )}

        {["layout", "both"].includes(useContext(EditorContext).editorModeStatus) && (
          <>
          <Section name={sectionNames.style}>
            {children.style.getPropertyView()}
          </Section>
          <Section name={sectionNames.labelStyle}>
            {children.labelStyle.getPropertyView()}
          </Section>
          <Section name={sectionNames.animationStyle} hasTooltip={true}>
            {children.animationStyle.getPropertyView()}
            </Section>
            </>
        )}
      </>
    ))
    .setExposeMethodConfigs(selectDivRefMethods)
    .build();
})();

SegmentedControlBasicComp = migrateOldData(SegmentedControlBasicComp, fixOldInputCompData);

export const SegmentedControlComp = withExposingConfigs(SegmentedControlBasicComp, [
  new NameConfig("value", trans("selectInput.valueDesc")),
  SelectInputInvalidConfig,
  ...CommonNameConfig,
]);
