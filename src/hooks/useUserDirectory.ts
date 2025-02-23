/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { useCallback, useState } from "react";

import { MatrixClientPeg } from "../MatrixClientPeg";
import { DirectoryMember } from "../utils/direct-messages";

export interface IUserDirectoryOpts {
    limit: number;
    query?: string;
}

export const useUserDirectory = () => {
    const [users, setUsers] = useState<DirectoryMember[]>([]);

    const [loading, setLoading] = useState(false);

    const search = useCallback(async ({
        limit = 20,
        query: term,
    }: IUserDirectoryOpts): Promise<boolean> => {
        if (!term?.length) {
            setUsers([]);
            return true;
        }

        try {
            setLoading(true);
            const { results } = await MatrixClientPeg.get().searchUserDirectory({
                limit,
                term,
            });
            setUsers(results.map(user => new DirectoryMember(user)));
            return true;
        } catch (e) {
            console.error("Could not fetch user in user directory for params", { limit, term }, e);
            setUsers([]);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        ready: true,
        loading,
        users,
        search,
    } as const;
};
