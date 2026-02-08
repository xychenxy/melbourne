          <FormControl fullWidth size="small" disabled={isZoneTypesLoading || isZoneTypesError} error={Boolean(errors.zoneTypeId)}>
            <InputLabel id="zone-type-label" size="small">
              Zone type
            </InputLabel>
            <Controller
              name="zoneTypeId"
              control={control}
              rules={{ required: "Zone type is required" }}
              render={({ field }) => (
                <Select labelId="zone-type-label" label="Zone type" size="small" {...field}>
                  {isZoneTypesLoading ? (
                    <MenuItem value="">Loading...</MenuItem>
                  ) : isZoneTypesError ? (
                    <MenuItem value="">Failed to load</MenuItem>
                  ) : (
                    (zoneTypes ?? []).map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
            {isZoneTypesError ? <FormHelperText error>Failed to load zone types.</FormHelperText> : null}
            {errors.zoneTypeId ? <FormHelperText error>{errors.zoneTypeId.message}</FormHelperText> : null}
          </FormControl>
          <Controller
            name="isTrackingEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} disabled={isSubmitting} />}
                label="Tracking enabled"
              />
            )}
          />
