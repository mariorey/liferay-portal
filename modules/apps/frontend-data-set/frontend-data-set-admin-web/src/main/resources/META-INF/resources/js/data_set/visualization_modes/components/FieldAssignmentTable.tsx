/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAlert from '@clayui/alert';
import {ClayInput} from '@clayui/form';
import ClayTable from '@clayui/table';
import classNames from 'classnames';
import {openModal} from 'frontend-js-components-web';
import React from 'react';

import '../../../../css/FieldAssignmentTable.scss';
import AddDataSourceFieldsModalContent from '../../../components/AddDataSourceFieldsModalContent';
import {IField, IFieldAssignment, IFieldTreeItem} from '../../../utils/types';
import {IDataSetSectionProps} from '../../DataSet';
import AddCustomFieldModalContent from './AddCustomFieldModalContent';
import FieldAssignmentControls from './FieldAssignmentControls';

interface IFieldAssignmentTableProps<T extends IFieldAssignment> {
	emptyStateMessage?: string;
	fieldAssignments: Array<T>;
	fieldTreeItems: Array<IFieldTreeItem>;
	labelColumnHeader: string;
	modalProps: IDataSetSectionProps;
	onClearSelection: (fieldAssignment: T) => void;
	onSelect: ({
		closeModal,
		fieldAssignment,
		selectedField,
	}: {
		closeModal: Function;
		fieldAssignment: T;
		selectedField: IField;
	}) => void;
	saveButtonDisabled?: boolean;
}

/**
 * The one table every visualization mode assigns its fields through. A built in
 * mode names a fixed set of elements, a client extension names whatever its
 * schema declares, and both arrive here as the same list of assignments so that
 * the two read as one screen.
 */
export default function FieldAssignmentTable<T extends IFieldAssignment>({
	emptyStateMessage,
	fieldAssignments,
	fieldTreeItems,
	labelColumnHeader,
	modalProps,
	onClearSelection,
	onSelect,
	saveButtonDisabled = false,
}: IFieldAssignmentTableProps<T>) {
	return (
		<>
			{emptyStateMessage &&
				!fieldAssignments.some(
					(fieldAssignment) => fieldAssignment.field
				) && (
					<ClayAlert
						displayType="info"
						title={`${Liferay.Language.get('info')}:`}
						variant="stripe"
					>
						{emptyStateMessage}
					</ClayAlert>
				)}

			<ClayTable className="field-assignment-table mb-0">
				<ClayTable.Head>
					<ClayTable.Row>
						<ClayTable.Cell
							className="field-assignment-label"
							headingCell
						>
							{labelColumnHeader}
						</ClayTable.Cell>

						<ClayTable.Cell className="field-name" headingCell>
							{Liferay.Language.get('field')}
						</ClayTable.Cell>
					</ClayTable.Row>
				</ClayTable.Head>

				<ClayTable.Body>
					{fieldAssignments.map((fieldAssignment) => (
						<FieldAssignmentRow
							fieldAssignment={fieldAssignment}
							fieldTreeItems={fieldTreeItems}
							key={fieldAssignment.name}
							modalProps={modalProps}
							onClearSelection={() =>
								onClearSelection(fieldAssignment)
							}
							onSelect={({closeModal, selectedField}) =>
								onSelect({
									closeModal,
									fieldAssignment,
									selectedField,
								})
							}
							saveButtonDisabled={saveButtonDisabled}
						/>
					))}
				</ClayTable.Body>
			</ClayTable>
		</>
	);
}

interface IFieldAssignmentRowProps {
	fieldAssignment: IFieldAssignment;
	fieldTreeItems: Array<IFieldTreeItem>;
	modalProps: IDataSetSectionProps;
	onClearSelection: () => void;
	onSelect: ({
		closeModal,
		selectedField,
	}: {
		closeModal: Function;
		selectedField: IField;
	}) => void;
	saveButtonDisabled: boolean;
}

function FieldAssignmentRow({
	fieldAssignment,
	fieldTreeItems,
	modalProps,
	onClearSelection,
	onSelect,
	saveButtonDisabled,
}: IFieldAssignmentRowProps) {
	const {description, field, label, required} = fieldAssignment;

	const openAddCustomFieldModal = () => {
		openModal({
			contentComponent: ({closeModal}: {closeModal: Function}) => (
				<AddCustomFieldModalContent
					{...modalProps}
					closeModal={closeModal}
					onSaveButtonClick={(selectedField: IField) =>
						onSelect({closeModal, selectedField})
					}
				/>
			),
		});
	};

	const openAddDataSourceFieldsModal = () => {
		openModal({
			className: 'modal-height-full',
			contentComponent: ({closeModal}: {closeModal: Function}) => (
				<AddDataSourceFieldsModalContent
					{...modalProps}
					closeModal={closeModal}
					fieldTreeItems={fieldTreeItems}
					onSaveButtonClick={({
						selectedFields,
					}: {
						selectedFields: Array<IField>;
					}) =>
						onSelect({closeModal, selectedField: selectedFields[0]})
					}
					saveButtonDisabled={saveButtonDisabled}
					selectedFields={field ? [field] : []}
				/>
			),
			size: 'lg',
		});
	};

	return (
		<ClayTable.Row>
			<ClayTable.Cell className="field-assignment-label">
				<strong>{label}</strong>

				{required && (
					<span className="ml-1 reference-mark text-warning">*</span>
				)}

				{description && <p className="form-text mb-0">{description}</p>}
			</ClayTable.Cell>

			<ClayTable.Cell className="field-name">
				<ClayInput.Group small>
					<ClayInput.GroupItem>
						<p
							className={classNames(
								'align-items-center d-flex mb-0',
								{'text-secondary': !field}
							)}
						>
							{field
								? field.label || field.name
								: Liferay.Language.get('not-assigned')}
						</p>
					</ClayInput.GroupItem>

					<ClayInput.GroupItem shrink>
						<FieldAssignmentControls
							field={field}
							label={label}
							onClearSelection={onClearSelection}
							openAddCustomFieldModal={openAddCustomFieldModal}
							openAddDataSourceFieldsModal={
								openAddDataSourceFieldsModal
							}
						/>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayTable.Cell>
		</ClayTable.Row>
	);
}
