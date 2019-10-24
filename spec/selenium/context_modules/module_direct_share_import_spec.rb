# Copyright (C) 2019 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

require_relative '../common'
require_relative 'page_objects/modules_index_page'

describe 'modules' do
    include_context 'in-process server selenium tests'
    include ModulesIndexPage

    context 'with direct share FF ON' do
        before(:each) do
            course_with_teacher_logged_in
            @course.save!
            @course.require_assignment_group
            @assignment1 = @course.assignments.create!(:title => 'Assignment First', :points_possible => 10)
            @module1 = @course.context_modules.create!(name: 'Test Module1')
            @module1.add_item(id: @assignment1.id, type: 'assignment')
            Account.default.enable_feature!(:direct_share)
            user_session(@teacher)
            visit_modules_index_page(@course.id)
        end

        it 'shows direct share options' do
            manage_module_menu(@module1.id, @module1.name).click
            
            expect(module_settings_menu.text).to include('Send To...')
            expect(module_settings_menu.text).to include('Copy To...')
        end
    end

    context 'with direct share FF OFF' do
        before(:each) do
            course_with_teacher_logged_in
            @course.save!
            @course.require_assignment_group
            @assignment1 = @course.assignments.create!(:title => 'Assignment First', :points_possible => 10)
            @module1 = @course.context_modules.create!(name: 'Test Module1')
            @module1.add_item(id: @assignment1.id, type: 'assignment')
            Account.default.disable_feature!(:direct_share)
            user_session(@teacher)
            visit_modules_index_page(@course.id)
        end

        it 'hides direct share options' do
            manage_module_menu(@module1.id, @module1.name).click
            
            expect(module_settings_menu.text).not_to include('Send To...')
            expect(module_settings_menu.text).not_to include('Copy To...')
        end
    end
end