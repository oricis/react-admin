import React, { FC, ReactElement } from 'react';
import PropTypes from 'prop-types';
import ActionDelete from '@material-ui/icons/Delete';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/core/styles';
import {
    useDeleteMany,
    useRefresh,
    useNotify,
    useUnselectAll,
    CRUD_DELETE_MANY,
    Identifier,
} from 'ra-core';

import Button, { ButtonProps } from './Button';

const useStyles = makeStyles(
    theme => ({
        deleteButton: {
            color: theme.palette.error.main,
            '&:hover': {
                backgroundColor: fade(theme.palette.error.main, 0.12),
                // Reset on mouse devices
                '@media (hover: none)': {
                    backgroundColor: 'transparent',
                },
            },
        },
    }),
    { name: 'RaBulkDeleteWithUndoButton' }
);

const BulkDeleteWithUndoButton: FC<BulkDeleteWithUndoButtonProps> = ({
    basePath,
    classes: classesOverride,
    icon,
    label,
    onClick,
    resource,
    selectedIds,
    ...rest
}) => {
    const classes = useStyles({ classes: classesOverride });
    const notify = useNotify();
    const unselectAll = useUnselectAll();
    const refresh = useRefresh();
    const [deleteMany, { loading }] = useDeleteMany(resource, selectedIds, {
        action: CRUD_DELETE_MANY,
        onSuccess: () => {
            notify(
                'ra.notification.deleted',
                'info',
                { smart_count: selectedIds.length },
                true
            );
            unselectAll(resource);
            refresh();
        },
        onFailure: error =>
            notify(
                typeof error === 'string'
                    ? error
                    : error.message || 'ra.notification.http_error',
                'warning'
            ),
        undoable: true,
    });

    const handleClick = e => {
        deleteMany();
        if (typeof onClick === 'function') {
            onClick(e);
        }
    };

    return (
        <Button
            onClick={handleClick}
            label={label}
            className={classes.deleteButton}
            disabled={loading}
            {...sanitizeRestProps(rest)}
        >
            {icon}
        </Button>
    );
};

const sanitizeRestProps = ({
    basePath,
    classes,
    filterValues,
    label,
    ...rest
}: Omit<BulkDeleteWithUndoButtonProps, 'resource' | 'selectedIds' | 'icon'>) =>
    rest;

interface Props {
    basePath?: string;
    filterValues?: any;
    icon: ReactElement;
    resource: string;
    selectedIds: Identifier[];
}

export type BulkDeleteWithUndoButtonProps = Props & ButtonProps;

BulkDeleteWithUndoButton.propTypes = {
    basePath: PropTypes.string,
    classes: PropTypes.object,
    label: PropTypes.string,
    resource: PropTypes.string.isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
    icon: PropTypes.element,
};

BulkDeleteWithUndoButton.defaultProps = {
    label: 'ra.action.delete',
    icon: <ActionDelete />,
};

export default BulkDeleteWithUndoButton;
