from typing import List, Optional
from uuid import UUID
from schema.database_schema import SystemConfigCreate, SystemConfigResponse
from db.supabase_client import get_supabase_client


class SystemConfigService:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.table = "system_configs"

    # CREATE
    def create_config(self, payload: SystemConfigCreate) -> SystemConfigResponse:
        data = payload.model_dump(exclude_none=True)

        res = self.supabase.table(self.table).insert(data).execute()

        return SystemConfigResponse(**res.data[0])

    # GET ALL
    def get_all_configs(self) -> List[SystemConfigResponse]:
        res = self.supabase.table(self.table).select("*").execute()

        return [SystemConfigResponse(**item) for item in res.data]

    # GET BY ID
    def get_config_by_id(self, config_id: UUID) -> Optional[SystemConfigResponse]:
        res = (
            self.supabase
            .table(self.table)
            .select("*")
            .eq("id", str(config_id))
            .limit(1)
            .execute()
        )

        if not res.data:
            return None

        return SystemConfigResponse(**res.data[0])

    # GET BY NAME
    def get_config_by_name(self, name: str) -> Optional[SystemConfigResponse]:
        res = (
            self.supabase
            .table(self.table)
            .select("*")
            .eq("name", name)
            .limit(1)
            .execute()
        )

        if not res.data:
            return None

        return SystemConfigResponse(**res.data[0])

    # UPDATE
    def update_config(
        self, config_id: UUID, payload: SystemConfigCreate
    ) -> Optional[SystemConfigResponse]:

        data = payload.model_dump(exclude_none=True)

        res = (
            self.supabase
            .table(self.table)
            .update(data)
            .eq("id", str(config_id))
            .execute()
        )

        if not res.data:
            return None

        return SystemConfigResponse(**res.data[0])

    # DELETE
    def delete_config(self, config_id: UUID) -> bool:
        res = (
            self.supabase
            .table(self.table)
            .delete()
            .eq("id", str(config_id))
            .execute()
        )

        return len(res.data) > 0