import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';
import { PreviousRouteService } from '../services/previous-route.service';

export const closeDialogGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const dialog = inject(MatDialog);
  const location = inject(Location);
  const previousRouteService = inject(PreviousRouteService);
  if (dialog.openDialogs.length > 0 && (previousRouteService.getPreviousUrl() == '' || nextState.url == previousRouteService.getPreviousUrl())) {
    location.go(currentState.url);
    dialog.closeAll();
    return false;
  }
  return true;
};
